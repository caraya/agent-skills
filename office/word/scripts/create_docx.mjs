#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  ImageRun,
  LevelFormat,
  Packer,
  patchDocument,
  PatchType,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType
} from 'docx';
import { Resvg } from '@resvg/resvg-js';
import { imageSize } from 'image-size';
import { marked } from 'marked';
import { parse as parseYaml } from 'yaml';
import JSZip from 'jszip';
import { JSDOM } from 'jsdom';

const require = createRequire(import.meta.url);
const WORD_NAMESPACE = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const CONTENT_MARKER = '{{content}}';
const CODE_FONT = 'Ubuntu Mono';
const headingLevels = [
  HeadingLevel.HEADING_1,
  HeadingLevel.HEADING_2,
  HeadingLevel.HEADING_3,
  HeadingLevel.HEADING_4,
  HeadingLevel.HEADING_5,
  HeadingLevel.HEADING_6
];
let mermaid;
let diagramNumber = 1;

async function loadMermaid() {
  if (mermaid) return mermaid;

  const { createHTMLWindow } = require('svgdom');
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM('');
  const svgWindow = createHTMLWindow();
  globalThis.window = svgWindow;
  globalThis.document = svgWindow.document;
  globalThis.CSSStyleSheet ??= dom.window.CSSStyleSheet;
  const loaded = await import('mermaid');
  mermaid = loaded.default ?? loaded;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'loose',
    htmlLabels: false,
    flowchart: { htmlLabels: false },
    theme: 'default'
  });
  return mermaid;
}

async function renderMermaid(source) {
  try {
    const renderer = await loadMermaid();
    const { svg } = await renderer.render(`word-diagram-${diagramNumber++}`, source);
    const png = new Resvg(svg, {
      background: '#ffffff',
      fitTo: { mode: 'width', value: 1200 }
    }).render().asPng();
    const { width, height } = imageSize(png);
    const scale = Math.min(1, 640 / width, 800 / height);
    return new ImageRun({
      type: 'png',
      data: png,
      transformation: { width: width * scale, height: height * scale },
      altText: {
        title: 'Mermaid diagram',
        description: 'Diagram rendered from a Mermaid code block',
        name: `Mermaid diagram ${diagramNumber - 1}`
      }
    });
  } catch (error) {
    throw new Error(`Failed to render Mermaid diagram: ${error.message}`, { cause: error });
  }
}

async function markdownImage(token, sourceDirectory) {
  if (/^[a-z][\w+.-]*:|^\/\//i.test(token.href)) {
    throw new Error('Markdown images must be local PNG or JPEG files.');
  }
  const imagePath = path.resolve(sourceDirectory, decodeURIComponent(token.href));
  const data = await readFile(imagePath);
  const { width, height, type } = imageSize(data);
  if (!['png', 'jpg'].includes(type)) {
    throw new Error(`Unsupported Markdown image format: ${type}; use PNG or JPEG.`);
  }
  const scale = Math.min(1, 640 / width, 800 / height);
  return new ImageRun({
    type,
    data,
    transformation: { width: width * scale, height: height * scale },
    altText: {
      title: token.title ?? token.text,
      description: token.text,
      name: path.basename(imagePath)
    }
  });
}

async function inlineRuns(tokens, style = {}, sourceDirectory, codeStyle) {
  const runs = [];
  for (const token of tokens) {
    if (token.type === 'strong') {
      runs.push(...await inlineRuns(token.tokens, { ...style, bold: true }, sourceDirectory, codeStyle));
    } else if (token.type === 'em') {
      runs.push(...await inlineRuns(token.tokens, { ...style, italics: true }, sourceDirectory, codeStyle));
    } else if (token.type === 'del') {
      runs.push(...await inlineRuns(token.tokens, { ...style, strike: true }, sourceDirectory, codeStyle));
    } else if (token.type === 'codespan') {
      runs.push(new TextRun({
        text: token.text, ...style, font: CODE_FONT, ...(codeStyle ? { style: codeStyle } : {})
      }));
    } else if (token.type === 'br') {
      runs.push(new TextRun({ text: '\n', ...style }));
    } else if (token.type === 'link') {
      if (!/^(https?:|mailto:)/i.test(token.href)) {
        throw new Error(`Unsupported link URL: ${token.href}`);
      }
      runs.push(new ExternalHyperlink({
        link: token.href,
        children: await inlineRuns(token.tokens, { ...style, underline: {} }, sourceDirectory, codeStyle)
      }));
    } else if (token.type === 'image') {
      runs.push(await markdownImage(token, sourceDirectory));
    } else if (token.type === 'text' && token.tokens) {
      runs.push(...await inlineRuns(token.tokens, style, sourceDirectory, codeStyle));
    } else if (token.type === 'text' || token.type === 'escape') {
      runs.push(new TextRun({ text: token.text, ...style }));
    } else {
      throw new Error(`Unsupported inline Markdown: ${token.type}`);
    }
  }
  return runs;
}

function parseSource(source) {
  const frontmatter = /^(?:\uFEFF)?---[ \t]*\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/.exec(source);
  if (!frontmatter) return { content: source, title: null };

  const metadata = parseYaml(frontmatter[1]);
  if (metadata !== null && (typeof metadata !== 'object' || Array.isArray(metadata))) {
    throw new Error('YAML frontmatter must be a mapping.');
  }
  const title = metadata?.title ?? null;
  if (title !== null && typeof title !== 'string') {
    throw new Error('The YAML frontmatter title must be a string.');
  }
  return { content: source.slice(frontmatter[0].length), title };
}

async function markdownContent(markdown, sourceDirectory, title, codeStyle) {
  const paragraphs = [];
  const numberingConfig = [];
  let orderedListNumber = 0;

  async function appendList(token, depth = 0) {
    const reference = token.ordered ? `ordered-list-${orderedListNumber++}` : null;
    if (reference) {
      numberingConfig.push({
        reference,
        levels: [{
          level: 0,
          format: LevelFormat.DECIMAL,
          text: '%1.',
          start: Number(token.start) || 1,
          alignment: AlignmentType.START,
          style: {
            paragraph: { indent: { left: 720 * (depth + 1), hanging: 360 } }
          }
        }]
      });
    }

    for (const item of token.items) {
      for (const itemToken of item.tokens) {
        if (itemToken.type === 'list') {
          await appendList(itemToken, depth + 1);
        } else if (itemToken.type === 'paragraph' || itemToken.type === 'text') {
          const children = await inlineRuns(itemToken.tokens, {}, sourceDirectory, codeStyle);
          if (item.task) {
            children.unshift(new TextRun({ text: item.checked ? '[x] ' : '[ ] ' }));
          }
          const listOptions = token.ordered
            ? {
              numbering: { reference, level: 0 },
              indent: { left: 720 * (depth + 1), hanging: 360 }
            }
            : { bullet: { level: 0 }, indent: { left: 720 * (depth + 1), hanging: 360 } };
          paragraphs.push(new Paragraph({ ...listOptions, children }));
        } else {
          throw new Error(`Unsupported list Markdown: ${itemToken.type}`);
        }
      }
    }
  }

  async function appendTokens(tokens, quote = false) {
    for (const token of tokens) {
      if (token.type === 'space') continue;
      if (token.type === 'heading') {
        paragraphs.push(new Paragraph({
          heading: headingLevels[token.depth - 1],
          indent: quote ? { left: 720 } : undefined,
          children: await inlineRuns(token.tokens, {}, sourceDirectory, codeStyle)
        }));
      } else if (token.type === 'paragraph' || token.type === 'text') {
        paragraphs.push(new Paragraph({
          indent: quote ? { left: 720 } : undefined,
          children: await inlineRuns(token.tokens, {}, sourceDirectory, codeStyle)
        }));
      } else if (token.type === 'blockquote') {
        await appendTokens(token.tokens, true);
      } else if (token.type === 'list') {
        await appendList(token);
      } else if (token.type === 'table') {
        const rows = [];
        for (const [rowIndex, row] of [token.header, ...token.rows].entries()) {
          const cells = [];
          for (const cell of row) {
            cells.push(new TableCell({
              width: { size: Math.floor(9360 / row.length), type: WidthType.DXA },
              shading: rowIndex === 0 ? { fill: 'E8EEF4' } : undefined,
              children: [new Paragraph({
                children: await inlineRuns(cell.tokens, {}, sourceDirectory, codeStyle)
              })]
            }));
          }
          rows.push(new TableRow({
            tableHeader: rowIndex === 0,
            children: cells
          }));
        }
        paragraphs.push(new Table({
          rows,
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: Array(token.header.length).fill(Math.floor(9360 / token.header.length)),
          borders: Object.fromEntries(
            ['top', 'bottom', 'left', 'right', 'insideHorizontal', 'insideVertical'].map((edge) => [
              edge,
              { style: BorderStyle.SINGLE, size: 4, color: 'D0D7DE' }
            ])
          )
        }));
      } else if (token.type === 'hr') {
        paragraphs.push(new Paragraph({
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 4, color: 'AAB4BF' }
          }
        }));
      } else if (
        token.type === 'code' &&
        ['mermaid', 'mmd'].includes(token.lang?.toLowerCase())
      ) {
        paragraphs.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [await renderMermaid(token.text)]
        }));
      } else if (token.type === 'code') {
        for (const line of token.text.split('\n')) {
          paragraphs.push(new Paragraph({
            children: [new TextRun({
              text: line, font: CODE_FONT, ...(codeStyle ? { style: codeStyle } : {})
            })],
            indent: { left: 360 },
            spacing: { after: 0 }
          }));
        }
      } else {
        throw new Error(`Unsupported block Markdown: ${token.type}`);
      }
    }
  }

  const tokens = marked.lexer(markdown);
  const firstToken = tokens.find((token) => token.type !== 'space');
  if (
    title &&
    !(firstToken?.type === 'heading' && firstToken.depth === 1 && firstToken.text === title)
  ) {
    paragraphs.unshift(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: title })]
    }));
  }
  await appendTokens(tokens);
  return { paragraphs, numberingConfig };
}

async function readTemplate(templatePath) {
  if (path.extname(templatePath).toLowerCase() !== '.docx') {
    throw new Error('The template must be a .docx file; .dotx templates are not supported.');
  }
  const bytes = await readFile(templatePath);
  const zip = await JSZip.loadAsync(bytes);
  if (!zip.file('word/document.xml') || !zip.file('[Content_Types].xml')) {
    throw new Error('The template must be a valid DOCX package with a main document part.');
  }
  const typesDom = new JSDOM(await zip.file('[Content_Types].xml').async('string'), {
    contentType: 'application/xml'
  });
  try {
    const documentType = [...typesDom.window.document.getElementsByTagNameNS(
      'http://schemas.openxmlformats.org/package/2006/content-types', 'Override'
    )].find((entry) => entry.getAttribute('PartName') === '/word/document.xml');
    if (documentType?.getAttribute('ContentType') !==
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml') {
      throw new Error('The template must use the DOCX document content type, not DOTX or macro-enabled formats.');
    }
  } finally {
    typesDom.window.close();
  }

  let markerCount = 0;
  let validMarker = false;
  let codeStyle;
  for (const part of zip.file(/^word\/.*\.xml$/)) {
    const dom = new JSDOM(await part.async('string'), { contentType: 'application/xml' });
    try {
      if (part.name === 'word/styles.xml' &&
        [...dom.window.document.getElementsByTagNameNS(WORD_NAMESPACE, 'style')].some((style) =>
          style.getAttributeNS(WORD_NAMESPACE, 'styleId') === 'Code' &&
          style.getAttributeNS(WORD_NAMESPACE, 'type') === 'character'
        )) {
        codeStyle = 'Code';
      }
      if (part.name === 'word/document.xml' &&
        dom.window.document.documentElement.tagName !== 'w:document') {
        throw new Error('The template main document must use the standard w:document namespace prefix.');
      }
      for (const paragraph of dom.window.document.getElementsByTagNameNS(WORD_NAMESPACE, 'p')) {
        const text = [...paragraph.getElementsByTagNameNS(WORD_NAMESPACE, 't')]
          .map((node) => node.textContent).join('');
        const occurrences = text.split(CONTENT_MARKER).length - 1;
        markerCount += occurrences;
        if (occurrences === 0) continue;

        const onlyTextRuns = [...paragraph.children].every((child) =>
          child.namespaceURI === WORD_NAMESPACE &&
          (child.tagName === 'w:pPr' || (child.tagName === 'w:r' &&
            [...child.children].every((runChild) =>
              runChild.namespaceURI === WORD_NAMESPACE &&
              ['w:rPr', 'w:t'].includes(runChild.tagName)
            )))
        );
        validMarker =
          part.name === 'word/document.xml' &&
          paragraph.tagName === 'w:p' &&
          paragraph.parentElement?.namespaceURI === WORD_NAMESPACE &&
          paragraph.parentElement.tagName === 'w:body' &&
          text.trim() === CONTENT_MARKER &&
          onlyTextRuns &&
          paragraph.getElementsByTagNameNS(WORD_NAMESPACE, 'sectPr').length === 0;
      }
    } finally {
      dom.window.close();
    }
  }
  if (markerCount !== 1 || !validMarker) {
    throw new Error(
      'The template must contain exactly one standalone {{content}} paragraph in the main document body, ' +
      'with plain text runs only and no section break, fields, images, or other content in that paragraph.'
    );
  }
  return { bytes, codeStyle };
}

export async function createDocx({ input, output, template }) {
  if (!input) throw new Error('A Markdown source path is required.');

  const inputPath = path.resolve(input);
  if (path.extname(inputPath).toLowerCase() !== '.md') {
    throw new Error('The source file must have a .md extension.');
  }
  const outputPath = path.resolve(output ?? inputPath.replace(/\.md$/i, '.docx'));
  const templateData = template ? await readTemplate(path.resolve(template)) : null;
  const markdown = await readFile(inputPath, 'utf8');
  const { content, title } = parseSource(markdown);
  const { paragraphs, numberingConfig } = await markdownContent(
    content, path.dirname(inputPath), title, templateData?.codeStyle
  );
  const buffer = templateData
    ? await patchDocument({
      outputType: 'nodebuffer',
      data: templateData.bytes,
      patches: { content: { type: PatchType.DOCUMENT, children: paragraphs } },
      numbering: { config: numberingConfig }
    })
    : await Packer.toBuffer(new Document({
      numbering: { config: numberingConfig },
      sections: [{ children: paragraphs }]
    }));
  await writeFile(outputPath, buffer, { flag: 'wx' });
  return outputPath;
}

async function main(args) {
  const usage = 'Usage: node create_docx.mjs <source.md> [output.docx] [--template template.docx]';
  if (args.includes('--help') || args.includes('-h')) {
    process.stdout.write(
      `${usage}\n\n` +
      'The output defaults to the source file path with a .docx extension.\n' +
      'The template must contain exactly one standalone {{content}} paragraph in its main body.\n'
    );
    return;
  }
  const positional = [];
  let template;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--template') {
      if (template) throw new Error('Specify --template only once.');
      template = args[++index];
      if (!template || template.startsWith('-')) {
        throw new Error('--template requires a DOCX file path.');
      }
    } else if (argument.startsWith('-')) {
      throw new Error(`Unknown option: ${argument}\n${usage}`);
    } else {
      positional.push(argument);
    }
  }
  if (positional.length < 1 || positional.length > 2) throw new Error(usage);
  const [input, output] = positional;
  const outputPath = await createDocx({ input, output, template });
  process.stdout.write(`Created ${outputPath}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

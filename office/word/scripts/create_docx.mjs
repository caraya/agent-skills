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

const require = createRequire(import.meta.url);
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

async function inlineRuns(tokens, style = {}, sourceDirectory) {
  const runs = [];
  for (const token of tokens) {
    if (token.type === 'strong') {
      runs.push(...await inlineRuns(token.tokens, { ...style, bold: true }, sourceDirectory));
    } else if (token.type === 'em') {
      runs.push(...await inlineRuns(token.tokens, { ...style, italics: true }, sourceDirectory));
    } else if (token.type === 'del') {
      runs.push(...await inlineRuns(token.tokens, { ...style, strike: true }, sourceDirectory));
    } else if (token.type === 'codespan') {
      runs.push(new TextRun({ text: token.text, ...style, font: 'Consolas' }));
    } else if (token.type === 'br') {
      runs.push(new TextRun({ text: '\n', ...style }));
    } else if (token.type === 'link') {
      if (!/^(https?:|mailto:)/i.test(token.href)) {
        throw new Error(`Unsupported link URL: ${token.href}`);
      }
      runs.push(new ExternalHyperlink({
        link: token.href,
        children: await inlineRuns(token.tokens, { ...style, underline: {} }, sourceDirectory)
      }));
    } else if (token.type === 'image') {
      runs.push(await markdownImage(token, sourceDirectory));
    } else if (token.type === 'text' && token.tokens) {
      runs.push(...await inlineRuns(token.tokens, style, sourceDirectory));
    } else if (token.type === 'text' || token.type === 'escape') {
      runs.push(new TextRun({ text: token.text, ...style }));
    } else {
      throw new Error(`Unsupported inline Markdown: ${token.type}`);
    }
  }
  return runs;
}

async function markdownContent(markdown, sourceDirectory) {
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
          const children = await inlineRuns(itemToken.tokens, {}, sourceDirectory);
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
          children: await inlineRuns(token.tokens, {}, sourceDirectory)
        }));
      } else if (token.type === 'paragraph' || token.type === 'text') {
        paragraphs.push(new Paragraph({
          indent: quote ? { left: 720 } : undefined,
          children: await inlineRuns(token.tokens, {}, sourceDirectory)
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
                children: await inlineRuns(cell.tokens, {}, sourceDirectory)
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
            children: [new TextRun({ text: line, font: 'Consolas' })],
            indent: { left: 360 },
            spacing: { after: 0 }
          }));
        }
      } else {
        throw new Error(`Unsupported block Markdown: ${token.type}`);
      }
    }
  }

  await appendTokens(marked.lexer(markdown));
  return { paragraphs, numberingConfig };
}

export async function createDocx({ input, output }) {
  if (!input) throw new Error('A Markdown source path is required.');

  const inputPath = path.resolve(input);
  if (path.extname(inputPath).toLowerCase() !== '.md') {
    throw new Error('The source file must have a .md extension.');
  }
  const outputPath = path.resolve(output ?? inputPath.replace(/\.md$/i, '.docx'));
  const markdown = await readFile(inputPath, 'utf8');
  const { paragraphs, numberingConfig } = await markdownContent(markdown, path.dirname(inputPath));
  const document = new Document({
    numbering: { config: numberingConfig },
    sections: [{ children: paragraphs }]
  });
  const buffer = await Packer.toBuffer(document);
  await writeFile(outputPath, buffer, { flag: 'wx' });
  return outputPath;
}

async function main(args) {
  if (args.includes('--help') || args.includes('-h')) {
    process.stdout.write(
      'Usage: node create_docx.mjs <source.md> [output.docx]\n\n' +
      'The output defaults to the source file path with a .docx extension.\n'
    );
    return;
  }
  const [input, output] = args;
  if (!input || input.startsWith('-')) {
    throw new Error('Usage: node create_docx.mjs <source.md> [output.docx]');
  }
  const outputPath = await createDocx({ input, output });
  process.stdout.write(`Created ${outputPath}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);

function loadPdfLib() {
  try {
    return require('pdf-lib');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new Error('pdf-lib is required. Install this skill package dependencies with `npm ci` in its directory.');
    }
    throw error;
  }
}

const TOKEN_COLORS = {
  comment: '#93a1a1',
  prolog: '#93a1a1',
  doctype: '#93a1a1',
  cdata: '#93a1a1',
  punctuation: '#586e75',
  property: '#268bd2',
  tag: '#268bd2',
  boolean: '#268bd2',
  number: '#268bd2',
  constant: '#268bd2',
  symbol: '#268bd2',
  deleted: '#268bd2',
  selector: '#2aa198',
  'attr-name': '#2aa198',
  string: '#2aa198',
  char: '#2aa198',
  builtin: '#2aa198',
  url: '#2aa198',
  inserted: '#2aa198',
  atrule: '#859900',
  'attr-value': '#859900',
  keyword: '#859900',
  function: '#b58900',
  'class-name': '#b58900',
  regex: '#cb4b16',
  important: '#cb4b16',
  variable: '#cb4b16',
  entity: '#657b83'
};
const TOKEN_BACKGROUNDS = { entity: '#eee8d5' };
const BOLD_TOKENS = new Set(['bold', 'important']);
const ITALIC_TOKENS = new Set(['italic']);
const DEFAULT_CODE_COLOR = '#657b83';
const CODE_BACKGROUND_COLOR = '#fdf6e3';
const LANGUAGE_ALIASES = {
  js: 'javascript',
  ts: 'typescript',
  html: 'markup',
  xml: 'markup',
  svg: 'markup',
  md: 'markdown',
  sh: 'bash',
  yml: 'yaml',
  py: 'python'
};

let prism;

function loadPrism() {
  if (prism) return prism;
  try {
    prism = require('prismjs');
    return prism;
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new Error('prismjs is required for fenced code blocks. Install this skill package dependencies with `npm ci` in its directory.');
    }
    throw error;
  }
}

function loadGrammar(language) {
  if (!language) return null;
  const name = LANGUAGE_ALIASES[language.toLowerCase()] ?? language.toLowerCase();
  if (!/^[a-z0-9-]+$/.test(name)) return null;

  const highlighter = loadPrism();
  if (!highlighter.languages[name]) {
    try {
      require(`prismjs/components/prism-${name}`);
    } catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') throw error;
      return null;
    }
  }
  const grammar = highlighter.languages[name];
  return grammar ? { highlighter, grammar } : null;
}

function flattenTokens(value, inheritedStyle = {}) {
  if (typeof value === 'string') {
    return [{
      text: value,
      color: inheritedStyle.color ?? null,
      background: inheritedStyle.background ?? null,
      bold: inheritedStyle.bold === true,
      italic: inheritedStyle.italic === true
    }];
  }
  if (Array.isArray(value)) return value.flatMap((part) => flattenTokens(part, inheritedStyle));

  const type = value.type;
  const style = {
    color: TOKEN_COLORS[type] ?? inheritedStyle.color ?? null,
    background: TOKEN_BACKGROUNDS[type] ?? inheritedStyle.background ?? null,
    bold: BOLD_TOKENS.has(type) || inheritedStyle.bold === true,
    italic: ITALIC_TOKENS.has(type) || inheritedStyle.italic === true
  };
  return flattenTokens(value.content, style);
}

function codeSegments(line, language) {
  const loaded = loadGrammar(language);
  if (!loaded) return [{ text: line, color: null }];
  return flattenTokens(loaded.highlighter.tokenize(line, loaded.grammar)).filter(
    (segment) => segment.text.length > 0
  );
}

function toPdfColor(hex, rgb) {
  const channels = hex.match(/[0-9a-f]{2}/gi).map((channel) => Number.parseInt(channel, 16) / 255);
  return rgb(...channels);
}

function codeFont(fonts, segment) {
  if (segment.bold && segment.italic) return fonts.codeBoldItalic;
  if (segment.bold) return fonts.codeBold;
  if (segment.italic) return fonts.codeItalic;
  return fonts.code;
}

let mermaid;
let nextDiagramId = 1;

async function loadMermaid() {
  if (mermaid) return mermaid;

  try {
    const { createHTMLWindow } = require('svgdom');
    const { JSDOM } = require('jsdom');
    const dom = new JSDOM('');
    const svgWindow = createHTMLWindow();
    globalThis.window = svgWindow;
    globalThis.document = svgWindow.document;
    if (typeof globalThis.CSSStyleSheet === 'undefined') {
      globalThis.CSSStyleSheet = dom.window.CSSStyleSheet;
    }
    const moduleUrl = import.meta.resolve(
      'mermaid',
      pathToFileURL(`${process.cwd()}/`).href
    );
    const loaded = await import(moduleUrl);
    mermaid = loaded.default ?? loaded;
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND' || error.code === 'ERR_MODULE_NOT_FOUND') {
      throw new Error(
        'Mermaid rendering requires mermaid, svgdom, and jsdom. Install this skill package dependencies with `npm ci` in its directory.'
      );
    }
    throw error;
  }

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
  const renderer = await loadMermaid();
  try {
    const { svg } = await renderer.render(`pdf-mermaid-${nextDiagramId++}`, source);
    return svg;
  } catch (error) {
    throw new Error(`Failed to render Mermaid diagram: ${error.message}`);
  }
}

function rasterizeSvg(svg) {
  let Resvg;
  try {
    ({ Resvg } = require('@resvg/resvg-js'));
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new Error('SVG rendering requires @resvg/resvg-js. Install this skill package dependencies with `npm ci` in its directory.');
    }
    throw error;
  }

  const viewBox = /\bviewBox=["']\s*(-?[\d.]+)\s+(-?[\d.]+)\s+([\d.]+)\s+([\d.]+)\s*["']/i.exec(svg);
  const viewWidth = Number(viewBox?.[3]) || 800;
  const viewHeight = Number(viewBox?.[4]) || 600;
  const scale = Math.min(1800 / viewWidth, 2400 / viewHeight);
  return new Resvg(svg, {
    background: '#ffffff',
    fitTo: { mode: 'zoom', value: scale }
  }).render().asPng();
}

async function prepareBlocks(pdf, blocks) {
  const prepared = [];
  for (const block of blocks) {
    if (block.type === 'code' && ['mermaid', 'mmd'].includes(block.language)) {
      const svg = await renderMermaid(block.lines.join('\n'));
      const png = rasterizeSvg(svg);
      prepared.push({ type: 'diagram', image: await pdf.embedPng(png) });
    } else {
      prepared.push(block);
    }
  }
  return prepared;
}

const PAGE_SIZES = {
  a4: [595.28, 841.89],
  letter: [612, 792]
};
const MARGIN = 54;

function usage() {
  return [
    'Usage: node create_pdf.mjs <source.md|txt|-> [output.pdf] [options]',
    '',
    'Options:',
    '  --page-size a4|letter  Page size (default: letter)',
    '  --font <file>          Embed a font for Unicode or custom typography',
    '  -h, --help             Show this help',
    '',
    'Known fenced code languages are syntax-highlighted with a print-friendly light palette.',
    'Use "-" as the source to read UTF-8 text from standard input.'
  ].join('\n');
}

function parseArguments(args) {
  const positional = [];
  const options = { pageSize: 'letter' };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '-h' || argument === '--help') {
      return { help: true };
    }
    if (argument === '--page-size' || argument === '--font') {
      const value = args[index + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`Missing value for ${argument}.\n\n${usage()}`);
      }
      if (argument === '--page-size') {
        if (!Object.hasOwn(PAGE_SIZES, value.toLowerCase())) {
          throw new Error(`Unsupported page size "${value}". Choose a4 or letter.`);
        }
        options.pageSize = value.toLowerCase();
      } else {
        options.fontPath = path.resolve(value);
      }
      index += 1;
      continue;
    }
    if (argument.startsWith('-') && argument !== '-') {
      throw new Error(`Unknown option "${argument}".\n\n${usage()}`);
    }
    positional.push(argument);
  }

  if (positional.length < 1 || positional.length > 2) {
    throw new Error(usage());
  }

  const source = positional[0];
  const sourcePath = source === '-' ? null : path.resolve(source);
  const outputPath = positional[1]
    ? path.resolve(positional[1])
    : sourcePath
      ? path.join(path.dirname(sourcePath), `${path.basename(sourcePath, path.extname(sourcePath))}.pdf`)
      : path.resolve('document.pdf');

  return { ...options, sourcePath, outputPath };
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}

function normalizeInlineMarkdown(text) {
  return text
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '[Image: $1] ($2)')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
    .replace(/(`+)(.*?)\1/g, '$2')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .trim();
}

function isSpecialLine(line) {
  return (
    /^#{1,6}\s+/.test(line) ||
    /^\s*([-*+]\s+|\d+[.)]\s+)/.test(line) ||
    /^\s*>\s?/.test(line) ||
    /^\s*(```|~~~)/.test(line) ||
    /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)
  );
}

function parseMarkdown(source) {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let paragraph = [];
  let codeLines = [];
  let codeFence = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: 'paragraph', text: normalizeInlineMarkdown(paragraph.join(' ')) });
      paragraph = [];
    }
  };

  for (const line of lines) {
    const fence = /^\s*(`{3,}|~{3,})(.*)$/.exec(line);
    if (fence) {
      if (!codeFence) {
        flushParagraph();
        codeFence = {
          character: fence[1][0],
          length: fence[1].length,
          language: fence[2].trim().split(/\s+/, 1)[0]?.toLowerCase() ?? null
        };
        codeLines = [];
        continue;
      }

      if (
        fence[1][0] === codeFence.character &&
        fence[1].length >= codeFence.length &&
        !fence[2].trim()
      ) {
        blocks.push({ type: 'code', language: codeFence.language, lines: codeLines });
        codeLines = [];
        codeFence = null;
        continue;
      }
    }

    if (codeFence) {
      codeLines.push(line);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      continue;
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      blocks.push({
        type: 'heading',
        level: heading[1].length,
        text: normalizeInlineMarkdown(heading[2])
      });
      continue;
    }

    if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      flushParagraph();
      blocks.push({ type: 'rule' });
      continue;
    }

    const listItem = /^(\s*)([-*+]|\d+[.)])\s+(.+)$/.exec(line);
    if (listItem) {
      flushParagraph();
      blocks.push({
        type: 'list',
        indent: Math.min(listItem[1].length, 8),
        marker: listItem[2],
        text: normalizeInlineMarkdown(listItem[3])
      });
      continue;
    }

    const quote = /^\s*>\s?(.*)$/.exec(line);
    if (quote) {
      flushParagraph();
      blocks.push({ type: 'quote', text: normalizeInlineMarkdown(quote[1]) });
      continue;
    }

    if (isSpecialLine(line)) {
      flushParagraph();
    }
    paragraph.push(line.trim());
  }

  flushParagraph();
  if (codeFence) {
    blocks.push({ type: 'code', language: codeFence.language, lines: codeLines });
  }
  return blocks;
}

function stripYamlComment(value) {
  let quote = null;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (quote === '"' && character === '"' && value[index - 1] !== '\\') {
      quote = null;
    } else if (quote === "'" && character === "'") {
      if (value[index + 1] === "'") {
        index += 1;
      } else {
        quote = null;
      }
    } else if (!quote && (character === '"' || character === "'")) {
      quote = character;
    } else if (!quote && character === '#' && (index === 0 || /\s/.test(value[index - 1]))) {
      return value.slice(0, index).trimEnd();
    }
  }
  return value;
}

function parseYamlTitle(value) {
  const scalar = stripYamlComment(value.trim()).trim();
  if (!scalar || scalar === 'null' || scalar === '~') return null;

  if (scalar.startsWith('"')) {
    try {
      return JSON.parse(scalar);
    } catch {
      throw new Error('Unable to parse the quoted YAML title; use a valid double-quoted string.');
    }
  }
  if (scalar.startsWith("'")) {
    if (!scalar.endsWith("'")) {
      throw new Error('Unable to parse the quoted YAML title; close the single-quoted string.');
    }
    return scalar.slice(1, -1).replace(/''/g, "'");
  }
  return scalar;
}

function parseSource(source) {
  const frontmatter = /^(?:\uFEFF)?---[ \t]*\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/.exec(source);
  if (!frontmatter) return { content: source, title: null };

  const titleField = /^(?:title|"title"|'title')\s*:\s*(.*?)\s*$/m.exec(frontmatter[1]);
  return {
    content: source.slice(frontmatter[0].length),
    title: titleField ? parseYamlTitle(titleField[1]) : null
  };
}

function splitLongWord(word, font, size, maxWidth) {
  const chunks = [];
  let chunk = '';
  for (const character of word) {
    if (chunk && font.widthOfTextAtSize(chunk + character, size) > maxWidth) {
      chunks.push(chunk);
      chunk = character;
    } else {
      chunk += character;
    }
  }
  if (chunk) chunks.push(chunk);
  return chunks;
}

function wrapText(text, font, size, maxWidth) {
  const lines = [];
  let line = '';

  for (const word of text.trim().split(/\s+/).filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
      continue;
    }

    if (line) {
      lines.push(line);
      line = '';
    }
    const pieces = splitLongWord(word, font, size, maxWidth);
    lines.push(...pieces.slice(0, -1));
    line = pieces.at(-1) ?? '';
  }

  if (line) lines.push(line);
  return lines;
}

async function loadFonts(pdf, fontPath, standardFonts) {
  if (fontPath) {
    let fontkit;
    try {
      fontkit = require('@pdf-lib/fontkit');
    } catch (error) {
      if (error.code === 'MODULE_NOT_FOUND') {
        throw new Error('@pdf-lib/fontkit is required when using --font. Install this skill package dependencies with `npm ci` in its directory.');
      }
      throw error;
    }
    pdf.registerFontkit(fontkit);
    const bytes = await readFile(fontPath);
    const font = await pdf.embedFont(bytes);
    return {
      body: font,
      heading: font,
      code: font,
      codeBold: font,
      codeItalic: font,
      codeBoldItalic: font
    };
  }

  return {
    body: await pdf.embedFont(standardFonts.Helvetica),
    heading: await pdf.embedFont(standardFonts.HelveticaBold),
    code: await pdf.embedFont(standardFonts.Courier),
    codeBold: await pdf.embedFont(standardFonts.CourierBold),
    codeItalic: await pdf.embedFont(standardFonts.CourierOblique),
    codeBoldItalic: await pdf.embedFont(standardFonts.CourierBoldOblique)
  };
}

function drawDocument(pdf, blocks, fonts, pageSize, rgb) {
  const [pageWidth, pageHeight] = PAGE_SIZES[pageSize];
  const contentWidth = pageWidth - MARGIN * 2;
  const bottom = MARGIN;
  let page;
  let y;

  const addPage = () => {
    page = pdf.addPage([pageWidth, pageHeight]);
    y = pageHeight - MARGIN;
  };
  const ensureSpace = (height) => {
    if (!page || y - height < bottom) addPage();
  };
  const drawLines = (lines, { font, size, x = MARGIN, lineHeight = size * 1.4, after = 8 }) => {
    for (const line of lines) {
      ensureSpace(lineHeight);
      page.drawText(line, { x, y: y - size, size, font });
      y -= lineHeight;
    }
    y -= after;
  };

  for (const block of blocks) {
    if (block.type === 'rule') {
      ensureSpace(14);
      page.drawLine({
        start: { x: MARGIN, y: y - 5 },
        end: { x: pageWidth - MARGIN, y: y - 5 },
        thickness: 0.6
      });
      y -= 14;
      continue;
    }

    if (block.type === 'heading') {
      const size = [24, 20, 16, 14, 12, 11][block.level - 1];
      const lines = wrapText(block.text, fonts.heading, size, contentWidth);
      drawLines(lines, { font: fonts.heading, size, lineHeight: size * 1.3, after: 10 });
      continue;
    }

    if (block.type === 'list') {
      const size = 11;
      const indent = 14 + block.indent * 8;
      const prefix = `${block.marker} `;
      const lines = wrapText(
        `${prefix}${block.text}`,
        fonts.body,
        size,
        contentWidth - indent
      );
      drawLines(lines, {
        font: fonts.body,
        size,
        x: MARGIN + indent,
        lineHeight: size * 1.4,
        after: 3
      });
      continue;
    }

    if (block.type === 'quote') {
      const size = 11;
      const lines = wrapText(block.text, fonts.body, size, contentWidth - 18);
      drawLines(lines, {
        font: fonts.body,
        size,
        x: MARGIN + 18,
        lineHeight: size * 1.4,
        after: 6
      });
      continue;
    }

    if (block.type === 'diagram') {
      const maxWidth = contentWidth;
      const maxHeight = pageHeight - 2 * MARGIN - 120;
      const scale = Math.min(maxWidth / block.image.width, maxHeight / block.image.height);
      const width = block.image.width * scale;
      const height = block.image.height * scale;
      ensureSpace(height + 14);
      page.drawImage(block.image, {
        x: (pageWidth - width) / 2,
        y: y - height,
        width,
        height
      });
      y -= height + 14;
      continue;
    }

    if (block.type === 'code') {
      const size = 9;
      const lineHeight = size * 1.3;
      const maxWidth = contentWidth - 12;
      const defaultColor = toPdfColor(DEFAULT_CODE_COLOR, rgb);
      const backgroundColor = toPdfColor(CODE_BACKGROUND_COLOR, rgb);
      for (const sourceLine of block.lines) {
        let lineSegments = [];
        let lineWidth = 0;
        const drawCodeLine = () => {
          ensureSpace(lineHeight);
          page.drawRectangle({
            x: MARGIN,
            y: y - lineHeight,
            width: contentWidth,
            height: lineHeight,
            color: backgroundColor
          });
          let x = MARGIN + 12;
          const segments = lineSegments.length ? lineSegments : [{ text: ' ', color: null }];
          for (const segment of segments) {
            const font = codeFont(fonts, segment);
            const textColor = segment.color ? toPdfColor(segment.color, rgb) : defaultColor;
            const width = font.widthOfTextAtSize(segment.text, size);
            if (segment.background) {
              page.drawRectangle({
                x,
                y: y - lineHeight,
                width,
                height: lineHeight,
                color: toPdfColor(segment.background, rgb)
              });
            }
            page.drawText(segment.text, { x, y: y - size, size, font, color: textColor });
            x += width;
          }
          y -= lineHeight;
          lineSegments = [];
          lineWidth = 0;
        };

        for (const segment of codeSegments(sourceLine, block.language)) {
          for (const character of segment.text) {
            const characterWidth = codeFont(fonts, segment).widthOfTextAtSize(character, size);
            if (lineSegments.length && lineWidth + characterWidth > maxWidth) {
              drawCodeLine();
            }
            const lastSegment = lineSegments.at(-1);
            if (
              lastSegment &&
              lastSegment.color === segment.color &&
              lastSegment.background === segment.background &&
              lastSegment.bold === segment.bold &&
              lastSegment.italic === segment.italic
            ) {
              lastSegment.text += character;
            } else {
              lineSegments.push({
                text: character,
                color: segment.color,
                background: segment.background,
                bold: segment.bold,
                italic: segment.italic
              });
            }
            lineWidth += characterWidth;
          }
        }
        drawCodeLine();
      }
      y -= 8;
      continue;
    }

    const size = 11;
    drawLines(wrapText(block.text, fonts.body, size, contentWidth), {
      font: fonts.body,
      size,
      lineHeight: size * 1.45,
      after: 9
    });
  }
}

async function createPdf({ source, outputPath, pageSize, fontPath }) {
  const parsedSource = parseSource(source);
  if (!parsedSource.content.trim()) {
    throw new Error('The source is empty; provide text or Markdown content.');
  }

  const { PDFDocument, StandardFonts, rgb } = loadPdfLib();
  const pdf = await PDFDocument.create();
  const title =
    parsedSource.title ??
    parsedSource.content.match(/^#\s+(.+)$/m)?.[1]?.trim() ??
    path.basename(outputPath, '.pdf');
  pdf.setTitle(title);
  const fonts = await loadFonts(pdf, fontPath, StandardFonts);
  const parsedBlocks = parseMarkdown(parsedSource.content);
  if (
    parsedSource.title &&
    !(parsedBlocks[0]?.type === 'heading' &&
      parsedBlocks[0].level === 1 &&
      parsedBlocks[0].text === parsedSource.title)
  ) {
    parsedBlocks.unshift({ type: 'heading', level: 1, text: parsedSource.title });
  }
  const blocks = await prepareBlocks(pdf, parsedBlocks);
  if (blocks.length === 0) {
    throw new Error('The source contains no printable content.');
  }

  try {
    drawDocument(pdf, blocks, fonts, pageSize, rgb);
  } catch (error) {
    if (/WinAnsi|encode/i.test(error.message)) {
      throw new Error(
        'The source contains characters unsupported by the standard PDF fonts. Rerun with --font <font-file> to embed a suitable font.'
      );
    }
    throw error;
  }

  const bytes = await pdf.save();
  const verified = await PDFDocument.load(bytes);
  if (verified.getPageCount() < 1) {
    throw new Error('PDF verification failed: the generated document has no pages.');
  }
  await writeFile(outputPath, bytes, { flag: 'wx' });
  return verified.getPageCount();
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }

  const source = options.sourcePath
    ? await readFile(options.sourcePath, 'utf8')
    : await readStdin();
  const pageCount = await createPdf({
    source,
    outputPath: options.outputPath,
    pageSize: options.pageSize,
    fontPath: options.fontPath
  });
  console.log(`Created ${options.outputPath} (${pageCount} page${pageCount === 1 ? '' : 's'}).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

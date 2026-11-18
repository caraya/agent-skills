#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import PptxGenJS from 'pptxgenjs';
import { marked } from 'marked';
import Prism from 'prismjs';
import loadLanguages from 'prismjs/components/index.js';
import components from 'prismjs/components.js';
import { imageSize } from 'image-size';

const syntaxColors = {
  comment: '93A1A1', prolog: '93A1A1', doctype: '93A1A1', cdata: '93A1A1',
  punctuation: '657B83', keyword: '859900', operator: '859900',
  string: '2AA198', char: '2AA198', builtin: 'B58900',
  boolean: 'CB4B16', number: 'D33682', function: '268BD2',
  'class-name': 'B58900', property: '268BD2', tag: '268BD2',
  'attr-name': 'B58900', 'attr-value': '2AA198', regex: 'DC322F',
};

function codeRuns(code, language, warn) {
  const label = language?.split(/\s+/)[0].toLowerCase();
  if (!label || ['text', 'plain', 'plaintext', 'txt'].includes(label)) {
    return [{ text: code, options: { color: '657B83' } }];
  }
  const canonical = Object.keys(components.languages).find((key) =>
    key !== 'meta' && (key === label || [components.languages[key].alias].flat().includes(label)));
  if (!canonical) {
    warn(`Unknown code language "${label}"; rendering plain monospace.`);
    return [{ text: code, options: { color: '657B83' } }];
  }
  loadLanguages([canonical]);
  function flatten(tokens, color = '657B83') {
    return [tokens].flat().flatMap((token) => typeof token === 'string'
      ? [{ text: token, options: { color } }]
      : flatten(token.content, syntaxColors[token.type] ?? color));
  }
  return flatten(Prism.tokenize(code, Prism.languages[canonical]));
}

function inline(tokens, options = {}) {
  return tokens.flatMap((token) => {
    if (token.type === 'strong') return inline(token.tokens, { ...options, bold: true });
    if (token.type === 'em') return inline(token.tokens, { ...options, italic: true });
    if (token.type === 'del') return inline(token.tokens, { ...options, strike: 'sngStrike' });
    if (token.type === 'codespan') return [{ text: token.text, options: { ...options, fontFace: 'Consolas' } }];
    if (token.type === 'br') return [{ text: '\n', options: { ...options } }];
    if (token.type === 'link') {
      if (!/^(https?:|mailto:)/i.test(token.href)) throw new Error(`Unsupported link URL: ${token.href}`);
      return inline(token.tokens, { ...options, hyperlink: { url: token.href }, underline: true });
    }
    if (token.type === 'text' && token.tokens) return inline(token.tokens, options);
    if (['text', 'escape'].includes(token.type)) return [{ text: token.text, options: { ...options } }];
    throw new Error(`Unsupported inline Markdown: ${token.type}`);
  });
}

const WIDTH = 13.333333;
const BOTTOM = 6.9;
const MARGIN = 0.6;
const LAYOUTS = ['title', 'content', 'two-column', 'code', 'image', 'table'];

function parseSlides(markdown, defaultLayout) {
  if (!LAYOUTS.includes(defaultLayout)) throw new Error(`Unknown layout: ${defaultLayout}`);
  const groups = [[]];
  for (const token of marked.lexer(markdown)) {
    if (token.type === 'hr') groups.push([]);
    else if (token.type !== 'space') groups.at(-1).push(token);
  }
  return groups.map((group, i) => {
    const directive = group[0]?.type === 'html' && group[0].text.trim().match(/^<!--\s*slide:\s*([\w-]+)\s*-->$/);
    const layout = directive ? directive[1] : defaultLayout;
    if (directive) group.shift();
    if (!LAYOUTS.includes(layout)) throw new Error(`Slide ${i + 1}: unknown layout "${layout}".`);
    if (!group.length) throw new Error(`Slide ${i + 1}: empty slide. Remove extra separators.`);
    return { layout, tokens: group };
  });
}

function plain(runs) {
  return runs.map((run) => run.text).join('');
}

function visualLength(text) {
  return [...text].reduce((length, char) => length + (char.codePointAt(0) > 255 ? 1 : 0.62), 0);
}

function textHeight(text, fontSize, width) {
  const lines = text.split('\n').reduce((count, line) =>
    count + Math.max(1, Math.ceil(visualLength(line) * fontSize / (72 * width))), 0);
  return lines * fontSize * 1.4 / 72 + 0.08;
}

function addText(slide, runs, box, fontSize, extra = {}) {
  const height = textHeight(plain(runs), fontSize, box.w);
  if (box.y + height > box.bottom) throw new Error('Content exceeds slide bounds; split this slide or shorten the text.');
  slide.addText(runs, {
    x: box.x, y: box.y, w: box.w, h: height,
    fontFace: 'Aptos', fontSize, color: '203040', margin: 0,
    valign: 'top', breakLine: false, paraSpaceAfter: 0,
    ...extra,
  });
  return box.y + height + 0.16;
}

function standaloneImage(token) {
  return token.type === 'paragraph' && token.tokens.length === 1 && token.tokens[0].type === 'image';
}

async function addImage(slide, token, box, sourceDir) {
  if (/^[a-z][\w+.-]*:|^\/\//i.test(token.href)) {
    throw new Error('Images must be local PNG or JPEG files, not URLs or data URIs.');
  }
  const file = path.resolve(sourceDir, decodeURIComponent(token.href));
  const bytes = await readFile(file);
  const size = imageSize(bytes);
  if (!['png', 'jpg'].includes(size.type)) throw new Error(`Unsupported image format: ${size.type}; use PNG or JPEG.`);
  const scale = Math.min(box.w / size.width, (box.bottom - box.y) / size.height);
  if (scale <= 0) throw new Error('No space left for image; split this slide.');
  const w = size.width * scale;
  const h = size.height * scale;
  slide.addImage({
    data: `image/${size.type === 'jpg' ? 'jpeg' : 'png'};base64,${bytes.toString('base64')}`,
    x: box.x + (box.w - w) / 2, y: box.y, w, h, altText: token.text,
  });
  return box.y + h + 0.16;
}

function addTable(slide, token, box) {
  const colWidth = box.w / token.header.length;
  if (colWidth < 1) throw new Error('Too many table columns; split this table.');
  const rows = [token.header, ...token.rows].map((row, i) => row.map((cell, j) => ({
    text: inline(cell.tokens),
    options: {
      bold: i === 0, fill: { color: i === 0 ? 'E8EEF4' : 'FFFFFF' },
      align: token.align[j] ?? 'left',
    },
  })));
  const rowH = rows.map((row) => Math.max(0.5,
    ...row.map((cell) => textHeight(plain(cell.text), 18, colWidth - 0.25) + 0.15)));
  const h = rowH.reduce((sum, height) => sum + height, 0);
  if (box.y + h > box.bottom) throw new Error('Table exceeds slide bounds; split its rows across slides.');
  slide.addTable(rows, {
    x: box.x, y: box.y, w: box.w, h, rowH, colW: colWidth,
    fontFace: 'Aptos', fontSize: 18, color: '203040',
    margin: 5, border: { type: 'solid', color: 'CFD8E0', pt: 1 },
    autoPage: false, valign: 'top', paraSpaceAfter: 0,
  });
  return box.y + h + 0.16;
}

async function renderBlocks(slide, tokens, box, warn, sourceDir) {
  let y = box.y;
  for (const token of tokens) {
    const current = () => ({ ...box, y });
    if (token.type === 'space') continue;
    if (standaloneImage(token)) {
      y = await addImage(slide, token.tokens[0], current(), sourceDir);
    } else if (token.type === 'table') {
      y = addTable(slide, token, current());
    } else if (token.type === 'heading' || token.type === 'paragraph' || token.type === 'text') {
      y = addText(slide, inline(token.tokens), current(), token.type === 'heading' ? 28 : 22);
    } else if (token.type === 'code') {
      const code = token.text.replace(/\t/g, '    ');
      const longest = Math.max(1, ...code.split('\n').map(visualLength));
      const lines = code.split('\n').length;
      const fontSize = Math.min(18, Math.floor(
        Math.min((box.w - 0.3) * 72 / longest, (box.bottom - y - 0.3) * 72 / (lines * 1.4))));
      if (fontSize < 12) throw new Error('Code exceeds slide bounds at 12 pt; split the block or shorten long lines.');
      const h = lines * fontSize * 1.4 / 72 + 0.24;
      slide.addText(codeRuns(code, token.lang, warn), {
        x: box.x, y, w: box.w, h, fontFace: 'Consolas',
        fontSize, color: '657B83', fill: { color: 'FDF6E3' },
        margin: 8, valign: 'top', wrap: false, paraSpaceAfter: 0,
        lineSpacingMultiple: 1.15,
      });
      y += h + 0.16;
    } else if (token.type === 'list') {
      for (const [i, item] of token.items.entries()) {
        if (item.task || item.tokens.some((part) => !['text', 'paragraph', 'space'].includes(part.type))) {
          throw new Error('Nested lists and task lists are not supported; flatten this list.');
        }
        const content = item.tokens.filter((part) => part.type !== 'space')
          .flatMap((part, j) => [...(j ? [{ text: '\n', options: {} }] : []), ...inline(part.tokens)]);
        y = addText(slide, content, current(), 22, {
          bullet: token.ordered ? { type: 'number', numberStartAt: Number(token.start) + i, indent: 18 } : { indent: 18 },
          hanging: 4,
        });
      }
    } else if (token.type === 'blockquote') {
      y = await renderBlocks(slide, token.tokens, { ...current(), x: box.x + 0.25, w: box.w - 0.25 }, warn, sourceDir);
    } else {
      throw new Error(`Unsupported Markdown block: ${token.type}. Use a supported slide layout.`);
    }
  }
  return y;
}

async function renderSlide(slide, spec, warn, sourceDir) {
  const tokens = [...spec.tokens];
  const title = tokens[0]?.type === 'heading' ? tokens.shift() : undefined;
  const box = { x: MARGIN, y: MARGIN, w: WIDTH - 2 * MARGIN, bottom: BOTTOM };
  if (spec.layout === 'title') {
    if (!title || tokens.some((token) => token.type !== 'paragraph')) {
      throw new Error('Title layout needs a heading followed by optional subtitle paragraphs.');
    }
    box.y = addText(slide, inline(title.tokens), { ...box, y: 2 }, 40, { align: 'center', bold: true });
    for (const token of tokens) box.y = addText(slide, inline(token.tokens), box, 24, { align: 'center' });
    return;
  }
  if (title) box.y = addText(slide, inline(title.tokens), box, 32, { bold: true });
  if (spec.layout === 'two-column') {
    const separators = tokens.flatMap((token, i) =>
      token.type === 'html' && /^<!--\s*column\s*-->$/.test(token.text.trim()) ? [i] : []);
    if (separators.length !== 1 || separators[0] === 0 || separators[0] === tokens.length - 1) {
      throw new Error('Two-column layout needs exactly one <!-- column --> between nonempty columns.');
    }
    const w = (box.w - 0.5) / 2;
    await renderBlocks(slide, tokens.slice(0, separators[0]), { ...box, w }, warn, sourceDir);
    await renderBlocks(slide, tokens.slice(separators[0] + 1), { ...box, x: box.x + w + 0.5, w }, warn, sourceDir);
  } else {
    if (spec.layout === 'code' && !tokens.some((token) => token.type === 'code')) {
      throw new Error('Code layout needs at least one fenced code block.');
    }
    if (spec.layout === 'image' && (tokens.length !== 1 || !standaloneImage(tokens[0]))) {
      throw new Error('Image layout needs one standalone Markdown image after its optional heading.');
    }
    if (spec.layout === 'table' && (tokens.length !== 1 || tokens[0].type !== 'table')) {
      throw new Error('Table layout needs one GFM table after its optional heading.');
    }
    await renderBlocks(slide, tokens, box, warn, sourceDir);
  }
}

export async function createPresentation({ input, output, defaultLayout = 'content', warn = console.warn }) {
  const markdown = await readFile(input, 'utf8');
  const specs = parseSlides(markdown, defaultLayout);
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Markdown PowerPoint builder';
  pptx.subject = 'Generated from Markdown using PptxGenJS';
  pptx.title = path.parse(input).name;
  for (const [i, spec] of specs.entries()) {
    const slide = pptx.addSlide();
    slide.background = { color: 'FFFFFF' };
    try {
      await renderSlide(slide, spec, warn, path.dirname(path.resolve(input)));
    } catch (error) {
      throw new Error(`Slide ${i + 1} (${spec.layout}): ${error.message}`, { cause: error });
    }
  }
  const destination = output ?? path.join(path.dirname(input), `${path.parse(input).name}.pptx`);
  const bytes = await pptx.write({ outputType: 'nodebuffer' });
  await writeFile(destination, bytes, { flag: 'wx' });
  return destination;
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: 'boolean', short: 'h' },
      'list-layouts': { type: 'boolean' },
      'default-layout': { type: 'string', default: 'content' },
    },
  });
  if (values.help) {
    console.log(`Usage: node create_pptx.mjs <source.md> [output.pptx] [options]

Options:
  --default-layout <type>   Layout for slides without a directive (default: content)
  --list-layouts           List supported slide content types
  -h, --help               Show this help

Separate slides with --- outside code fences.
Select a layout with <!-- slide: TYPE --> at the start of a slide.
Separate two-column content with <!-- column -->.`);
    return;
  }
  if (values['list-layouts']) {
    console.log(LAYOUTS.join('\n'));
    return;
  }
  if (positionals.length < 1 || positionals.length > 2) {
    throw new Error('Expected <source.md> and optional [output.pptx]. Use --help for usage.');
  }
  if (positionals[1] && path.extname(positionals[1]).toLowerCase() !== '.pptx') {
    throw new Error('Output filename must end in .pptx.');
  }
  const output = await createPresentation({
    input: positionals[0], output: positionals[1], defaultLayout: values['default-layout'],
    warn: (message) => console.warn(`Warning: ${message}`),
  });
  console.log(`Created ${path.resolve(output)}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  });
}

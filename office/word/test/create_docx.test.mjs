import assert from 'node:assert/strict';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import JSZip from 'jszip';
import {
  Document, ExternalHyperlink, Footer, Header, ImageRun, LevelFormat,
  Packer, PageNumber, Paragraph, SectionProperties, Table, TableCell, TableRow, TextRun
} from 'docx';
import { JSDOM } from 'jsdom';
import { createDocx } from '../scripts/create_docx.mjs';

const scriptPath = path.resolve(import.meta.dirname, '../scripts/create_docx.mjs');
const wordNamespace = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

function readXml(xml) {
  return new JSDOM(xml, { contentType: 'application/xml' }).window.document;
}

test('starter template embeds every Google Sans face and retains the fonts in generated documents', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'markdown-word-embedded-fonts-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const template = path.resolve(import.meta.dirname, '../templates/starter.docx');
  const input = path.join(directory, 'report.md');
  const output = path.join(directory, 'report.docx');
  const originalBytes = await readFile(template);
  const original = await JSZip.loadAsync(originalBytes);
  const fontTable = readXml(await original.file('word/fontTable.xml').async('string'));
  const font = [...fontTable.getElementsByTagNameNS(wordNamespace, 'font')]
    .find((entry) => entry.getAttributeNS(wordNamespace, 'name') === 'Google Sans');
  assert.ok(font, 'Google Sans must have an embedded font-table entry');
  const relationshipNamespace = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const relationships = readXml(await original.file('word/_rels/fontTable.xml.rels').async('string'));
  const embeddedParts = [];
  for (const [face, weight, italic] of [
    ['Regular', 400, false], ['Bold', 700, false], ['Italic', 400, true], ['BoldItalic', 700, true]
  ]) {
    const entry = font.getElementsByTagNameNS(wordNamespace, `embed${face}`)[0];
    assert.ok(entry, `missing embedded ${face} face`);
    const id = entry.getAttributeNS(relationshipNamespace, 'id');
    const relationship = [...relationships.documentElement.children]
      .find((node) => node.getAttribute('Id') === id);
    assert.ok(relationship, `missing font relationship ${id}`);
    const part = path.posix.join('word', relationship.getAttribute('Target'));
    embeddedParts.push(part);
    const data = await original.file(part).async('nodebuffer');
    const decoded = Buffer.from(data);
    const key = Buffer.from(entry.getAttributeNS(wordNamespace, 'fontKey').replace(/[{}-]/g, ''), 'hex').reverse();
    for (let index = 0; index < 32; index += 1) decoded[index] ^= key[index % 16];
    assert.equal(decoded.readUInt32BE(0), 0x00010000, 'embedded data must decode to a TrueType font');
    const tables = new Map();
    for (let index = 0; index < decoded.readUInt16BE(4); index += 1) {
      const offset = 12 + index * 16;
      tables.set(decoded.toString('ascii', offset, offset + 4), decoded.readUInt32BE(offset + 8));
    }
    assert.equal(tables.has('fvar'), false, 'use static faces for Word font embedding');
    assert.ok(tables.has('OS/2'));
    const os2 = tables.get('OS/2');
    assert.equal(decoded.readUInt16BE(os2 + 4), weight);
    assert.equal((decoded.readUInt16BE(os2 + 62) & 1) === 1, italic);
  }
  const settings = readXml(await original.file('word/settings.xml').async('string'));
  assert.equal(settings.getElementsByTagNameNS(wordNamespace, 'embedTrueTypeFonts').length, 1);
  await writeFile(input, '---\ntitle: Embedded report\n---\n\n**Bold**, *italic*, and ***both***.\n');
  await createDocx({ input, output, template });
  const generated = await JSZip.loadAsync(await readFile(output));
  for (const part of embeddedParts) {
    assert.deepEqual(await generated.file(part).async('nodebuffer'), await original.file(part).async('nodebuffer'));
  }
  const generatedFontTable = readXml(await generated.file('word/fontTable.xml').async('string'));
  const generatedRelationships = readXml(await generated.file('word/_rels/fontTable.xml.rels').async('string'));
  assert.equal(generatedFontTable.documentElement.innerHTML, fontTable.documentElement.innerHTML);
  assert.equal(generatedRelationships.documentElement.innerHTML, relationships.documentElement.innerHTML);
  const generatedSettings = readXml(await generated.file('word/settings.xml').async('string'));
  assert.equal(generatedSettings.getElementsByTagNameNS(wordNamespace, 'embedTrueTypeFonts').length, 1);
  const document = readXml(await generated.file('word/document.xml').async('string'));
  const firstParagraph = document.getElementsByTagNameNS(wordNamespace, 'p')[0];
  assert.equal(firstParagraph.textContent, 'Embedded report');
  assert.equal(
    firstParagraph.getElementsByTagNameNS(wordNamespace, 'pStyle')[0].getAttributeNS(wordNamespace, 'val'),
    'Heading1'
  );
  assert.deepEqual(await readFile(template), originalBytes);
});

test('inserts Markdown into a template with its title first and preserves fixed content and styles', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'markdown-word-template-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const input = path.join(directory, 'report.md');
  const output = path.join(directory, 'report.docx');
  const template = path.join(directory, 'letterhead.docx');
  const source = '---\ntitle: Quarterly Brief\nauthor: Hidden Author\n---\n\n## Results\n\nA **bold** result.\n';
  await writeFile(input, source);
  const templateBytes = await Packer.toBuffer(new Document({
    styles: {
      default: {
        document: { run: { font: 'Georgia', size: 24 } },
        heading1: { run: { font: 'Georgia', color: '234567', size: 40 } }
      }
    },
    sections: [{
      properties: { page: { margin: { top: 1600, bottom: 1600, left: 1700, right: 1700 } } },
      headers: { default: new Header({ children: [new Paragraph('Company letterhead')] }) },
      footers: {
        default: new Footer({
          children: [new Paragraph({ children: [new TextRun({ children: [PageNumber.CURRENT] })] })]
        })
      },
      children: [
        new Paragraph('Fixed introduction'),
        new Paragraph({ children: [new TextRun('{{con'), new TextRun('tent}}')] }),
        new Paragraph('Fixed closing')
      ]
    }]
  }));
  await writeFile(template, templateBytes);

  await createDocx({ input, output, template });

  const original = await JSZip.loadAsync(templateBytes);
  const result = await JSZip.loadAsync(await readFile(output));
  const document = readXml(await result.file('word/document.xml').async('string'));
  const paragraphs = [...document.getElementsByTagNameNS(wordNamespace, 'p')];
  assert.deepEqual(paragraphs.map((paragraph) => paragraph.textContent), [
    'Fixed introduction', 'Quarterly Brief', 'Results', 'A bold result.', 'Fixed closing'
  ]);
  assert.equal(
    paragraphs[1].getElementsByTagNameNS(wordNamespace, 'pStyle')[0].getAttributeNS(wordNamespace, 'val'),
    'Heading1'
  );
  assert.equal(
    paragraphs[2].getElementsByTagNameNS(wordNamespace, 'pStyle')[0].getAttributeNS(wordNamespace, 'val'),
    'Heading2'
  );
  assert.equal(paragraphs[3].getElementsByTagNameNS(wordNamespace, 'b').length, 1);
  const originalDocument = readXml(await original.file('word/document.xml').async('string'));
  assert.equal(
    document.getElementsByTagNameNS(wordNamespace, 'sectPr')[0].outerHTML,
    originalDocument.getElementsByTagNameNS(wordNamespace, 'sectPr')[0].outerHTML
  );
  const originalStyles = readXml(await original.file('word/styles.xml').async('string'));
  const resultStyles = readXml(await result.file('word/styles.xml').async('string'));
  assert.equal(resultStyles.documentElement.innerHTML, originalStyles.documentElement.innerHTML);
  for (const part of original.file(/^word\/(?:header|footer)\d+\.xml$/)) {
    const before = readXml(await part.async('string'));
    const after = readXml(await result.file(part.name).async('string'));
    assert.equal(after.documentElement.innerHTML, before.documentElement.innerHTML);
  }
  assert.equal(await readFile(input, 'utf8'), source);
  assert.deepEqual(await readFile(template), templateBytes);
});

test('CLI resolves its dependencies from the skill and defaults output beside the source', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'markdown-word-cli-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const sourceDirectory = path.join(directory, 'source');
  await mkdir(sourceDirectory);
  const input = path.join(sourceDirectory, 'cli.md');
  await writeFile(input, '# CLI document\n');

  const result = spawnSync(process.execPath, [scriptPath, input], {
    cwd: directory,
    encoding: 'utf8'
  });

  assert.equal(result.status, 0, result.stderr);
  const output = path.join(sourceDirectory, 'cli.docx');
  await assert.doesNotReject(() => access(output));
  const zip = await JSZip.loadAsync(await readFile(output));
  assert.ok(zip.file('word/document.xml'));
});

test('rejects templates without exactly one standalone body marker before writing output', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'markdown-word-marker-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const input = path.join(directory, 'report.md');
  const output = path.join(directory, 'report.docx');
  const template = path.join(directory, 'template.docx');
  await writeFile(input, '# Report\n');
  const sectionMarker = new Paragraph('{{content}}');
  sectionMarker.addSectionProperties(new SectionProperties({}));
  const cases = [
    { children: [new Paragraph('No marker')] },
    { children: [new Paragraph('{{content}}'), new Paragraph('{{content}}')] },
    { children: [new Paragraph('Before {{content}} after')] },
    { children: [new Paragraph('{{content}}{{content}}')] },
    {
      headers: { default: new Header({ children: [new Paragraph('{{content}}')] }) },
      children: [new Paragraph('No body marker')]
    },
    {
      headers: { default: new Header({ children: [new Paragraph('{{content}}')] }) },
      children: [new Paragraph('{{content}}')]
    },
    {
      children: [new Paragraph({
        children: [new TextRun('{{content}}'), new TextRun({ children: [PageNumber.CURRENT] })]
      })]
    },
    {
      children: [new Table({
        rows: [new TableRow({ children: [new TableCell({ children: [new Paragraph('{{content}}')] })] })]
      })]
    },
    {
      children: [sectionMarker]
    }
  ];
  for (const section of cases) {
    const bytes = await Packer.toBuffer(new Document({ sections: [section] }));
    await writeFile(template, bytes);
    await assert.rejects(
      () => createDocx({ input, output, template }),
      /exactly one standalone.*\{\{content\}\}.*body/i
    );
    await assert.rejects(() => access(output), { code: 'ENOENT' });
    assert.deepEqual(await readFile(template), bytes);
  }
});

test('CLI accepts a template path from another working directory and keeps the frontmatter title first', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'markdown-word-template-cli-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const input = path.join(directory, 'report.md');
  const template = path.join(directory, 'company template.docx');
  await writeFile(input, '---\ntitle: Report\n---\n\n# Report\n\nBody.\n');
  await writeFile(template, await Packer.toBuffer(new Document({
    sections: [{
      children: [new Paragraph('{{content}}'), new Paragraph('Template closing')]
    }]
  })));
  const result = spawnSync(process.execPath, [scriptPath, '--template', template, input], {
    cwd: path.resolve(import.meta.dirname, '..'),
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr);
  const zip = await JSZip.loadAsync(await readFile(path.join(directory, 'report.docx')));
  const document = readXml(await zip.file('word/document.xml').async('string'));
  const paragraphs = [...document.getElementsByTagNameNS(wordNamespace, 'p')];
  assert.deepEqual(paragraphs.map((paragraph) => paragraph.textContent), ['Report', 'Body.', 'Template closing']);
  assert.equal(
    paragraphs[0].getElementsByTagNameNS(wordNamespace, 'pStyle')[0].getAttributeNS(wordNamespace, 'val'),
    'Heading1'
  );
});

test('merges template images, numbering, links, tables, and Mermaid without identifier collisions', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'markdown-word-template-rich-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const input = path.join(directory, 'report.md');
  const output = path.join(directory, 'report.docx');
  const template = path.join(directory, 'template.docx');
  const image = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a6l8AAAAASUVORK5CYII=',
    'base64'
  );
  await writeFile(path.join(directory, 'pixel.png'), image);
  await writeFile(input, `---
title: Rich report
---

3. First generated item
4. Second generated item

- Generated bullet

[Generated link](https://example.com/report)

| Name | Value |
| --- | --- |
| Answer | 42 |

![Generated pixel](pixel.png)

\`\`\`mermaid
graph TD
  A[Start] --> B[Finish]
\`\`\`
`);
  const templateBytes = await Packer.toBuffer(new Document({
    numbering: {
      config: [{
        reference: 'template-list',
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', start: 5 }]
      }]
    },
    sections: [{
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [new ImageRun({ type: 'png', data: image, transformation: { width: 20, height: 20 } })]
          })]
        })
      },
      children: [
        new Paragraph({
          numbering: { reference: 'template-list', level: 0 },
          children: [new TextRun('Template list item')]
        }),
        new Paragraph({
          children: [new ExternalHyperlink({
            link: 'https://example.com/company', children: [new TextRun('Company link')]
          })]
        }),
        new Table({
          rows: [new TableRow({ children: [new TableCell({ children: [new Paragraph('Template table')] })] })]
        }),
        new Paragraph('{{content}}')
      ]
    }]
  }));
  await writeFile(template, templateBytes);
  await createDocx({ input, output, template });
  const original = await JSZip.loadAsync(templateBytes);
  const result = await JSZip.loadAsync(await readFile(output));
  const document = readXml(await result.file('word/document.xml').async('string'));
  assert.equal(document.getElementsByTagNameNS(wordNamespace, 'tbl').length, 2);
  assert.equal(document.getElementsByTagNameNS(wordNamespace, 'drawing').length, 2);
  assert.match(document.documentElement.textContent, /Rich report/);
  assert.doesNotMatch(document.documentElement.textContent, /title:|graph TD/);
  for (const part of original.file(/^word\/media\//)) {
    assert.deepEqual(await result.file(part.name).async('nodebuffer'), await part.async('nodebuffer'));
  }
  assert.ok(result.file(/^word\/media\//).length > original.file(/^word\/media\//).length);
  const drawingIds = [];
  for (const part of result.file(/^word\/(?:document|header\d+|footer\d+)\.xml$/)) {
    const xml = readXml(await part.async('string'));
    drawingIds.push(...[...xml.getElementsByTagNameNS(
      'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing', 'docPr'
    )].map((element) => element.getAttribute('id')));
  }
  assert.equal(drawingIds.length, 3);
  assert.equal(new Set(drawingIds).size, drawingIds.length);
  const numbering = readXml(await result.file('word/numbering.xml').async('string'));
  const originalNumbering = readXml(await original.file('word/numbering.xml').async('string'));
  for (const name of ['num', 'abstractNum']) {
    const attribute = name === 'num' ? 'numId' : 'abstractNumId';
    const elements = [...numbering.getElementsByTagNameNS(wordNamespace, name)];
    const ids = elements.map((element) => element.getAttributeNS(wordNamespace, attribute));
    assert.equal(new Set(ids).size, ids.length);
    for (const originalElement of originalNumbering.getElementsByTagNameNS(wordNamespace, name)) {
      const matching = elements.find((element) =>
        element.getAttributeNS(wordNamespace, attribute) === originalElement.getAttributeNS(wordNamespace, attribute)
      );
      assert.equal(matching.outerHTML, originalElement.outerHTML);
    }
  }
  const listIds = [...numbering.getElementsByTagNameNS(wordNamespace, 'num')]
    .map((element) => element.getAttributeNS(wordNamespace, 'numId'));
  const bodyIds = [...document.getElementsByTagNameNS(wordNamespace, 'numId')]
    .map((element) => element.getAttributeNS(wordNamespace, 'val'));
  assert.equal(new Set(bodyIds).size, 3);
  assert.ok(bodyIds.every((id) => listIds.includes(id)));
  assert.match(numbering.documentElement.outerHTML, /<w:start w:val="3"/);
  const relationships = readXml(await result.file('word/_rels/document.xml.rels').async('string'));
  const entries = [...relationships.documentElement.children];
  assert.equal(new Set(entries.map((entry) => entry.getAttribute('Id'))).size, entries.length);
  for (const url of ['https://example.com/company', 'https://example.com/report']) {
    assert.ok(entries.some((entry) => entry.getAttribute('Target') === url));
  }
  for (const node of document.getElementsByTagNameNS(
    'http://schemas.openxmlformats.org/drawingml/2006/main', 'blip'
  )) {
    const id = node.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'embed');
    const entry = entries.find((relationship) => relationship.getAttribute('Id') === id);
    assert.ok(entry, `missing relationship ${id}`);
    assert.ok(result.file(path.posix.join('word', entry.getAttribute('Target'))));
  }
});

test('template conversion rejects invalid CLI options and never overwrites its inputs or an existing output', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'markdown-word-template-errors-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const input = path.join(directory, 'source.md');
  const template = path.join(directory, 'template.docx');
  const output = path.join(directory, 'output.docx');
  const bytes = await Packer.toBuffer(new Document({
    sections: [{ children: [new Paragraph('{{content}}')] }]
  }));
  await writeFile(input, '# Report\n');
  await writeFile(template, bytes);
  for (const args of [
    [input, '--template'],
    [input, '--template', template, '--template', template],
    [input, '--unknown'],
    [input, output, 'extra.docx']
  ]) {
    const result = spawnSync(process.execPath, [scriptPath, ...args], { encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /requires a DOCX file path|only once|Unknown option|Usage:/);
    await assert.rejects(() => access(output), { code: 'ENOENT' });
  }
  await writeFile(output, 'Keep existing output');
  await assert.rejects(() => createDocx({ input, output, template }), { code: 'EEXIST' });
  await assert.rejects(() => createDocx({ input, output: template, template }), { code: 'EEXIST' });
  await assert.rejects(() => createDocx({ input, output: input, template }), { code: 'EEXIST' });
  assert.equal(await readFile(output, 'utf8'), 'Keep existing output');
  assert.equal(await readFile(input, 'utf8'), '# Report\n');
  assert.deepEqual(await readFile(template), bytes);
  const dotx = path.join(directory, 'template.dotx');
  await writeFile(dotx, bytes);
  await assert.rejects(() => createDocx({ input, output, template: dotx }), /template must be a \.docx/);
  const renamedDotx = await JSZip.loadAsync(bytes);
  renamedDotx.file('[Content_Types].xml',
    (await renamedDotx.file('[Content_Types].xml').async('string'))
      .replace('wordprocessingml.document.main+xml', 'wordprocessingml.template.main+xml'));
  await writeFile(template, await renamedDotx.generateAsync({ type: 'nodebuffer' }));
  await assert.rejects(() => createDocx({ input, output, template }), /DOCX document content type/);
  await writeFile(template, 'Not a ZIP file');
  await assert.rejects(() => createDocx({ input, output, template }), /zip file|central directory/i);
});

test('creates a DOCX package with required XML parts and rendered Markdown', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'markdown-word-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const input = path.join(directory, 'report.md');
  const output = path.join(directory, 'report.docx');
  await writeFile(input, '# Report title\n\nA **bold** sentence.\n');

  await createDocx({ input, output });
  await assert.doesNotReject(() => access(output));

  const zip = await JSZip.loadAsync(await readFile(output));
  for (const part of [
    '[Content_Types].xml',
    '_rels/.rels',
    'word/document.xml',
    'word/styles.xml',
    'word/_rels/document.xml.rels'
  ]) {
    assert.ok(zip.file(part), `missing DOCX package part ${part}`);
  }

  const document = await zip.file('word/document.xml').async('string');
  assert.match(document, /<w:t[^>]*>Report title<\/w:t>/);
  assert.match(document, /<w:t[^>]*>bold<\/w:t>/);
});

test('strips frontmatter and renders its title as the first Heading 1', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'markdown-word-title-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const input = path.join(directory, 'report.md');
  const output = path.join(directory, 'report.docx');
  const source = '---\ntitle: "Quarterly Brief"\nauthor: Example Author\n---\n\n## Results\n\nDocument content.\n';
  await writeFile(input, source);

  await createDocx({ input, output });
  const zip = await JSZip.loadAsync(await readFile(output));
  const document = await zip.file('word/document.xml').async('string');
  const paragraphs = document.match(/<w:p[ >][\s\S]*?<\/w:p>/g);
  assert.match(paragraphs[0], /<w:pStyle w:val="Heading1"\/>/);
  assert.match(paragraphs[0], /<w:t[^>]*>Quarterly Brief<\/w:t>/);
  assert.match(paragraphs[1], /<w:t[^>]*>Results<\/w:t>/);
  assert.match(document, /Document content\./);
  assert.doesNotMatch(document, /title:|author:|Example Author|---/);
  assert.equal(await readFile(input, 'utf8'), source);
});

test('renders Mermaid fences to PNG images embedded in the DOCX', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'markdown-word-mermaid-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const input = path.join(directory, 'diagram.md');
  const output = path.join(directory, 'diagram.docx');
  await writeFile(
    input,
    '# Flow\n\n```mermaid\ngraph TD\n  A[Start] --> B[Finish]\n```\n'
  );

  await createDocx({ input, output });
  const zip = await JSZip.loadAsync(await readFile(output));
  const images = zip.file(/^word\/media\/.+\.png$/);
  assert.equal(images.length, 1);
  const image = await images[0].async('nodebuffer');
  assert.deepEqual([...image.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);

  const document = await zip.file('word/document.xml').async('string');
  assert.match(document, /<w:drawing>/);
  assert.doesNotMatch(document, /graph TD|A\[Start\]/);
  const relationships = await zip.file('word/_rels/document.xml.rels').async('string');
  assert.match(relationships, /relationships\/image/);
});

test('preserves an existing opening heading without adding a duplicate', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'markdown-word-heading-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  for (const [name, frontmatter] of [
    ['matching', '---\ntitle: Report\n---\n\n'],
    ['untitled', '---\nauthor: Example Author\n---\n\n'],
    ['absent', '']
  ]) {
    const input = path.join(directory, `${name}.md`);
    const output = path.join(directory, `${name}.docx`);
    await writeFile(input, `${frontmatter}# Report\n\nBody.\n\n---\n`);
    await createDocx({ input, output });
    const zip = await JSZip.loadAsync(await readFile(output));
    const document = await zip.file('word/document.xml').async('string');
    assert.equal((document.match(/<w:t[^>]*>Report<\/w:t>/g) ?? []).length, 1);
    assert.doesNotMatch(document, /author:|Example Author/);
    assert.match(document, /<w:pBdr>/);
  }
});

test('rejects invalid YAML and non-string frontmatter titles before writing output', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'markdown-word-invalid-title-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const input = path.join(directory, 'report.md');
  const output = path.join(directory, 'report.docx');
  for (const [metadata, error] of [
    ['title: [unclosed', /YAML|flow sequence/],
    ['title: [Report]', /title must be a string/],
    ['- Report', /frontmatter must be a mapping/]
  ]) {
    await writeFile(input, `---\n${metadata}\n---\n\nBody.\n`);
    await assert.rejects(() => createDocx({ input, output }), error);
    await assert.rejects(() => access(output), { code: 'ENOENT' });
  }
});

test('preserves lists, block quotes, and tables as Word structures', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'markdown-word-structure-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const input = path.join(directory, 'content.md');
  const output = path.join(directory, 'content.docx');
  await writeFile(input, `> Quoted text

- Bullet item

1. Numbered item

| Name | Value |
| --- | --- |
| Answer | 42 |
`);

  await createDocx({ input, output });
  const zip = await JSZip.loadAsync(await readFile(output));
  const document = await zip.file('word/document.xml').async('string');
  assert.match(document, /<w:tbl>/);
  assert.match(document, /<w:numPr>/);
  for (const text of ['Quoted text', 'Bullet item', 'Numbered item', 'Answer', '42']) {
    assert.ok(document.includes(text), `missing Markdown text: ${text}`);
  }
});

test('embeds local Markdown images and preserves their alt text', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'markdown-word-image-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const input = path.join(directory, 'image.md');
  const output = path.join(directory, 'image.docx');
  await writeFile(
    path.join(directory, 'pixel.png'),
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a6l8AAAAASUVORK5CYII=',
      'base64'
    )
  );
  await writeFile(input, '![A tiny pixel](pixel.png)\n');

  await createDocx({ input, output });
  const zip = await JSZip.loadAsync(await readFile(output));
  assert.equal(zip.file(/^word\/media\/.+\.png$/).length, 1);
  const document = await zip.file('word/document.xml').async('string');
  assert.match(document, /descr="A tiny pixel"/);
  assert.match(document, /<w:drawing>/);
});

import assert from 'node:assert/strict';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import JSZip from 'jszip';
import { createDocx } from '../scripts/create_docx.mjs';

const scriptPath = path.resolve(import.meta.dirname, '../scripts/create_docx.mjs');

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

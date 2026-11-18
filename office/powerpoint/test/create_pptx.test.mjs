import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import JSZip from 'jszip';
import { createPresentation } from '../scripts/create_pptx.mjs';

async function workspace(t) {
  const dir = await mkdtemp(path.join(tmpdir(), 'markdown-pptx-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}

test('writes editable Markdown slides without splitting separators inside fences', async (t) => {
  const dir = await workspace(t);
  const input = path.join(dir, 'talk.md');
  const output = path.join(dir, 'talk.pptx');
  await writeFile(input, '# Hello\n\nA **bold** introduction.\n\n---\n\n# Example\n\n```text\n---\n```\n');
  await createPresentation({ input, output });
  const zip = await JSZip.loadAsync(await readFile(output));
  assert.equal(Object.keys(zip.files).filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name)).length, 2);
  const first = await zip.file('ppt/slides/slide1.xml').async('string');
  assert.match(first, /Hello/);
  assert.match(first, /b="1"[^>]*>[\s\S]*?<a:t>bold<\/a:t>/);
  const second = await zip.file('ppt/slides/slide2.xml').async('string');
  assert.match(second, /<a:t>---<\/a:t>/);
});

test('highlights complete fenced blocks including multiline comments and language aliases', async (t) => {
  const dir = await workspace(t);
  const input = path.join(dir, 'code.md');
  await writeFile(input, '# Code\n\n```js\n/* first\nsecond */\nconst answer = 42;\n```\n');
  const output = await createPresentation({ input });
  const zip = await JSZip.loadAsync(await readFile(output));
  const xml = await zip.file('ppt/slides/slide1.xml').async('string');
  assert.match(xml, /val="859900"/); // Solarized keyword
  assert.match(xml, /val="93A1A1"/); // Solarized comment, spanning both lines
  assert.match(xml, /second \*\//);
  assert.match(xml, /Consolas/);
  assert.equal(zip.file(/ppt\/media\//).length, 0);
});

test('selects title and two-column layouts with independent column positions', async (t) => {
  const dir = await workspace(t);
  const input = path.join(dir, 'layouts.md');
  await writeFile(input, `<!-- slide: title -->
# A title

A subtitle

---
<!-- slide: two-column -->
# Compare

Left content

<!-- column -->

Right content
`);
  const zip = await JSZip.loadAsync(await readFile(await createPresentation({ input })));
  const title = await zip.file('ppt/slides/slide1.xml').async('string');
  assert.match(title, /algn="ctr"/);
  const columns = await zip.file('ppt/slides/slide2.xml').async('string');
  const left = columns.match(/<p:sp>[\s\S]*?<a:t>Left content<\/a:t>[\s\S]*?<\/p:sp>/)?.[0];
  const right = columns.match(/<p:sp>(?:(?!<\/p:sp>)[\s\S])*<a:t>Right content<\/a:t>[\s\S]*?<\/p:sp>/)?.[0];
  assert.ok(left);
  assert.ok(right);
  assert.ok(Number(right.match(/<a:off x="(\d+)"/)[1]) > 6_000_000);
  assert.doesNotMatch(columns, /&lt;!--/);
});

test('embeds a local image relative to the source with alt text and preserved aspect ratio', async (t) => {
  const dir = await workspace(t);
  const input = path.join(dir, 'image.md');
  await writeFile(path.join(dir, 'pixel.png'), Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a6l8AAAAASUVORK5CYII=', 'base64'));
  await writeFile(input, '<!-- slide: image -->\n# Image\n\n![A tiny pixel](pixel.png)\n');
  const zip = await JSZip.loadAsync(await readFile(await createPresentation({ input })));
  assert.ok(zip.file(/ppt\/media\/.*\.png$/).length > 0);
  const xml = await zip.file('ppt/slides/slide1.xml').async('string');
  assert.match(xml, /descr="A tiny pixel"/);
  const size = xml.match(/<p:pic>[\s\S]*?<a:ext cx="(\d+)" cy="(\d+)"/);
  assert.ok(size);
  assert.equal(size[1], size[2]);
});

test('uses the selected default layout to create a native editable table', async (t) => {
  const dir = await workspace(t);
  const input = path.join(dir, 'table.md');
  await writeFile(input, '# Results\n\n| Feature | Value |\n| --- | ---: |\n| **Build** | 42 |\n');
  const zip = await JSZip.loadAsync(await readFile(await createPresentation({ input, defaultLayout: 'table' })));
  const xml = await zip.file('ppt/slides/slide1.xml').async('string');
  assert.match(xml, /<a:tbl>/);
  assert.match(xml, /<a:t>Build<\/a:t>/);
  assert.match(xml, /algn="r"/);
  assert.equal(zip.file(/ppt\/slides\/slide\d+\.xml$/).length, 1);
});

test('CLI creates the default output and refuses to overwrite an existing deck', async (t) => {
  const dir = await workspace(t);
  const input = path.join(dir, 'cli.md');
  await writeFile(input, '# CLI\n\n```js\nconst value = 42;\n```\n');
  const script = fileURLToPath(new URL('../scripts/create_pptx.mjs', import.meta.url));
  const args = [script, input, '--default-layout', 'code'];
  const result = spawnSync(process.execPath, args, { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const output = path.join(dir, 'cli.pptx');
  assert.match(result.stdout, /cli\.pptx/);
  const bytes = await readFile(output);
  assert.ok(bytes.length > 1000);
  const again = spawnSync(process.execPath, args, { encoding: 'utf8' });
  assert.equal(again.status, 1);
  assert.match(again.stderr, /EEXIST/);
  assert.deepEqual(await readFile(output), bytes);
});

test('reports invalid slide content and overflow without writing an output', async (t) => {
  const cases = [
    ['<!-- slide: unknown -->\n# Bad\n', /unknown layout/],
    ['<!-- slide: two-column -->\n# Bad\n\nNo separator\n', /exactly one/],
    ['<!-- slide: code -->\n# Bad\n\nNo code\n', /fenced code block/],
    ['<!-- slide: image -->\n# Bad\n\nNot an image\n', /standalone Markdown image/],
    ['<!-- slide: table -->\n# Bad\n\nNot a table\n', /GFM table/],
    ['# Too much\n\n' + 'Long paragraph. '.repeat(1000), /exceeds slide bounds/],
    ['# Too much code\n\n```js\n' + 'x'.repeat(1000) + '\n```\n', /12 pt/],
    ['# Too many rows\n\n| A |\n| - |\n' + '| x |\n'.repeat(40), /Table exceeds/],
    ['# Remote image\n\n![No network](https://example.com/image.png)\n', /Images must be local/],
    ['# HTML\n\n<div>Unsupported</div>\n', /Unsupported Markdown block: html/],
    ['', /empty slide/],
  ];
  const dir = await workspace(t);
  for (const [i, [markdown, expected]] of cases.entries()) {
    const input = path.join(dir, `invalid-${i}.md`);
    const output = path.join(dir, `invalid-${i}.pptx`);
    await writeFile(input, markdown);
    await assert.rejects(createPresentation({ input, output }), expected);
    await assert.rejects(readFile(output), { code: 'ENOENT' });
  }
});

test('unknown fence languages warn and retain the original code as plain text', async (t) => {
  const dir = await workspace(t);
  const input = path.join(dir, 'unknown.md');
  await writeFile(input, '# Unknown\n\n```not-a-language\nliteral <source> & text\n```\n');
  const warnings = [];
  const output = await createPresentation({ input, warn: (message) => warnings.push(message) });
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /Unknown code language/);
  const zip = await JSZip.loadAsync(await readFile(output));
  const xml = await zip.file('ppt/slides/slide1.xml').async('string');
  assert.match(xml, /literal &lt;source&gt; &amp; text/);
});

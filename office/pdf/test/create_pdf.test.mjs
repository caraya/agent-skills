import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { inflateSync } from 'node:zlib';
import { PDFDocument, PDFName } from 'pdf-lib';

const skillDirectory = path.resolve(import.meta.dirname, '..');
const scriptPath = path.join(skillDirectory, 'scripts', 'create_pdf.mjs');

function getPageContent(pdf, page) {
  const contents = page.node.Contents();
  return Array.from({ length: contents.size() }, (_, index) => {
    const stream = pdf.context.lookup(contents.get(index));
    return inflateSync(stream.contents).toString('latin1');
  }).join('\n');
}

test('creates a multipage PDF from a Markdown source file', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'pdf-skill-test-'));
  const sourcePath = path.join(directory, 'release-notes.md');
  const outputPath = path.join(directory, 'release-notes.pdf');
  const paragraphs = Array.from(
    { length: 100 },
    (_, index) => `Paragraph ${index + 1}: This content should flow cleanly across pages.`
  );
  await writeFile(sourcePath, `# Release Notes\n\n${paragraphs.join('\n\n')}`, 'utf8');

  try {
    const result = spawnSync(process.execPath, [scriptPath, sourcePath, outputPath], {
      cwd: skillDirectory,
      encoding: 'utf8'
    });

    assert.equal(result.status, 0, result.stderr);
    const bytes = await readFile(outputPath);
    assert.equal(bytes.subarray(0, 5).toString('ascii'), '%PDF-');
    const pdf = await PDFDocument.load(bytes);
    assert.equal(pdf.getTitle(), 'Release Notes');
    assert.ok(pdf.getPageCount() > 1);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('reads UTF-8 document content from standard input', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'pdf-skill-stdin-test-'));
  const outputPath = path.join(directory, 'document.pdf');

  try {
    const result = spawnSync(process.execPath, [scriptPath, '-', outputPath], {
      cwd: skillDirectory,
      encoding: 'utf8',
      input: '# In-memory document\n\nCreated from standard input.'
    });

    assert.equal(result.status, 0, result.stderr);
    const pdf = await PDFDocument.load(await readFile(outputPath));
    assert.equal(pdf.getPageCount(), 1);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('resolves dependencies from the skill when run outside the skill directory', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'pdf-skill-cwd-test-'));
  const outputPath = path.join(directory, 'document.pdf');

  try {
    const result = spawnSync(process.execPath, [scriptPath, '-', outputPath], {
      cwd: directory,
      encoding: 'utf8',
      input: '# Code sample\n\n```js\nconst answer = 42;\n```'
    });

    assert.equal(result.status, 0, result.stderr);
    const pdf = await PDFDocument.load(await readFile(outputPath));
    assert.equal(pdf.getPageCount(), 1);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('shows help without requiring target-project dependencies', () => {
  const result = spawnSync(process.execPath, [scriptPath, '--help'], {
    cwd: path.resolve(skillDirectory, '../..'),
    encoding: 'utf8'
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Usage: node create_pdf\.mjs/);
});

test('does not replace an existing output file', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'pdf-skill-overwrite-test-'));
  const sourcePath = path.join(directory, 'source.md');
  const outputPath = path.join(directory, 'source.pdf');
  await writeFile(sourcePath, '# New document\n\nContent.', 'utf8');
  await writeFile(outputPath, 'keep this file', 'utf8');

  try {
    const result = spawnSync(process.execPath, [scriptPath, sourcePath, outputPath], {
      cwd: skillDirectory,
      encoding: 'utf8'
    });

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /EEXIST/);
    assert.equal(await readFile(outputPath, 'utf8'), 'keep this file');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('reports text that the standard fonts cannot encode', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'pdf-skill-font-test-'));
  const sourcePath = path.join(directory, 'unicode.md');
  const outputPath = path.join(directory, 'unicode.pdf');
  await writeFile(sourcePath, '# Unicode\n\n漢字', 'utf8');

  try {
    const result = spawnSync(process.execPath, [scriptPath, sourcePath, outputPath], {
      cwd: skillDirectory,
      encoding: 'utf8'
    });

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /--font/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('uses the YAML frontmatter title as the PDF title', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'pdf-skill-title-test-'));
  const sourcePath = path.join(directory, 'source.md');
  const outputPath = path.join(directory, 'source.pdf');
  await writeFile(
    sourcePath,
    '---\ntitle: "Quarterly Brief"\n---\n\n# Section heading\n\nDocument content.',
    'utf8'
  );

  try {
    const result = spawnSync(process.execPath, [scriptPath, sourcePath, outputPath], {
      cwd: skillDirectory,
      encoding: 'utf8'
    });

    assert.equal(result.status, 0, result.stderr);
    const pdf = await PDFDocument.load(await readFile(outputPath));
    assert.equal(pdf.getTitle(), 'Quarterly Brief');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('syntax-highlights fenced JavaScript code in the PDF', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'pdf-skill-code-test-'));
  const sourcePath = path.join(directory, 'code.md');
  const outputPath = path.join(directory, 'code.pdf');
  await writeFile(sourcePath, '# Example\n\n```js\nconst answer = 42;\n```', 'utf8');

  try {
    const result = spawnSync(process.execPath, [scriptPath, sourcePath, outputPath], {
      cwd: skillDirectory,
      encoding: 'utf8'
    });

    assert.equal(result.status, 0, result.stderr);
    const pdf = await PDFDocument.load(await readFile(outputPath));
    const content = getPageContent(pdf, pdf.getPages()[0]);
    const solarizedKeywordColor = `${0x85 / 255} ${0x99 / 255} 0 rg`;
    assert.ok(content.includes(solarizedKeywordColor));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('renders Mermaid fences as embedded images, not source text', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'pdf-skill-mermaid-test-'));
  const sourcePath = path.join(directory, 'diagram.md');
  const outputPath = path.join(directory, 'diagram.pdf');
  await writeFile(
    sourcePath,
    '# Flow\n\n```mermaid\ngraph TD\n  A[Start] -->|Continue| B[Finish]\n```',
    'utf8'
  );

  try {
    const result = spawnSync(process.execPath, [scriptPath, sourcePath, outputPath], {
      cwd: skillDirectory,
      encoding: 'utf8'
    });

    assert.equal(result.status, 0, result.stderr);
    const pdf = await PDFDocument.load(await readFile(outputPath));
    const pages = pdf.getPages();
    const hasImageObject = pages.some((page) => {
      const xObjects = page.node.Resources().lookup(PDFName.of('XObject'));
      return xObjects?.entries().some(([, reference]) => {
        const object = pdf.context.lookup(reference);
        return object.dict?.get(PDFName.of('Subtype'))?.toString() === '/Image';
      });
    });
    assert.equal(hasImageObject, true);
    const renderedText = pages
      .map((page) => getPageContent(pdf, page))
      .join('\n')
      .replace(/<([0-9A-Fa-f]+)> Tj/g, (_, hex) => Buffer.from(hex, 'hex').toString('utf8'));
    assert.doesNotMatch(renderedText, /graph TD|A\[Start\]/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

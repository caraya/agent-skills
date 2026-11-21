import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

const script = fileURLToPath(new URL('../scripts/create_xlsx.mjs', import.meta.url));

async function workspace(t) {
  const dir = await mkdtemp(path.join(tmpdir(), 'excel-skill-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}

test('creates an editable workbook with multiple sheets and typed cells', async (t) => {
  const dir = await workspace(t);
  const input = path.join(dir, 'data.json');
  await writeFile(input, JSON.stringify({
    sheets: [
      { name: 'Sales', rows: [['Item', 'Count', 'Active'], ['Widget', 42, true]] },
      { name: 'Notes', rows: [['=1+1', null, '003']] },
    ],
  }));
  const result = spawnSync(process.execPath, [script, input], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const output = path.join(dir, 'data.xlsx');
  const workbook = XLSX.read(await readFile(output), { type: 'buffer' });
  assert.deepEqual(workbook.SheetNames, ['Sales', 'Notes']);
  assert.equal(workbook.Sheets.Sales.A2.v, 'Widget');
  assert.equal(workbook.Sheets.Sales.B2.v, 42);
  assert.equal(workbook.Sheets.Sales.C2.v, true);
  assert.equal(workbook.Sheets.Notes.A1.v, '=1+1');
  assert.equal(workbook.Sheets.Notes.A1.f, undefined);
  assert.equal(workbook.Sheets.Notes.C1.v, '003');
});

test('rejects unsupported cell values without creating a workbook', async (t) => {
  const dir = await workspace(t);
  const input = path.join(dir, 'invalid.json');
  await writeFile(input, JSON.stringify({ sheets: [{ name: 'Data', rows: [[{ value: 1 }]] }] }));
  const result = spawnSync(process.execPath, [script, input], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /cell.*string, number, boolean, or null/i);
  await assert.rejects(readFile(path.join(dir, 'invalid.xlsx')), { code: 'ENOENT' });
});

test('rejects malformed workbook structure with a clear error', async (t) => {
  const dir = await workspace(t);
  const input = path.join(dir, 'invalid.json');
  await writeFile(input, JSON.stringify({ sheets: [{ name: 'Data', rows: ['not a row'] }] }));
  const result = spawnSync(process.execPath, [script, input], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /row.*array/i);
});

test('rejects integers that cannot be represented precisely', async (t) => {
  const dir = await workspace(t);
  const input = path.join(dir, 'unsafe.json');
  await writeFile(input, '{"sheets":[{"name":"Data","rows":[[9007199254740993]]}]}');
  const result = spawnSync(process.execPath, [script, input], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /safe integer/i);
});

test('rejects sheet names that differ only by case', async (t) => {
  const dir = await workspace(t);
  const input = path.join(dir, 'duplicates.json');
  await writeFile(input, JSON.stringify({
    sheets: [{ name: 'Data', rows: [] }, { name: 'data', rows: [] }],
  }));
  const result = spawnSync(process.execPath, [script, input], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /duplicate.*sheet name/i);
});

test('does not overwrite an existing output', async (t) => {
  const dir = await workspace(t);
  const input = path.join(dir, 'data.json');
  const output = path.join(dir, 'data.xlsx');
  await writeFile(input, JSON.stringify({ sheets: [{ name: 'Data', rows: [[1]] }] }));
  await writeFile(output, 'existing file');
  const result = spawnSync(process.execPath, [script, input], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /EEXIST/);
  assert.equal(await readFile(output, 'utf8'), 'existing file');
});

test('overwrites an existing output only when explicitly requested', async (t) => {
  const dir = await workspace(t);
  const input = path.join(dir, 'data.json');
  const output = path.join(dir, 'data.xlsx');
  await writeFile(input, JSON.stringify({ sheets: [{ name: 'Data', rows: [[42]] }] }));
  await writeFile(output, 'existing file');
  const result = spawnSync(process.execPath, [script, input, output, '--overwrite'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const workbook = XLSX.read(await readFile(output), { type: 'buffer' });
  assert.equal(workbook.Sheets.Data.A1.v, 42);
});

test('never overwrites the source through an output symlink', async (t) => {
  const dir = await workspace(t);
  const input = path.join(dir, 'data.json');
  const output = path.join(dir, 'data.xlsx');
  const source = JSON.stringify({ sheets: [{ name: 'Data', rows: [[42]] }] });
  await writeFile(input, source);
  await symlink(input, output);
  const result = spawnSync(process.execPath, [script, input, output, '--overwrite'], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /source/i);
  assert.equal(await readFile(input, 'utf8'), source);
});

test('rejects unknown sheet properties instead of discarding them', async (t) => {
  const dir = await workspace(t);
  const input = path.join(dir, 'unsupported.json');
  await writeFile(input, JSON.stringify({
    sheets: [{ name: 'Data', rows: [[1]], columns: ['Amount'] }],
  }));
  const result = spawnSync(process.execPath, [script, input], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /unsupported.*columns/i);
});

test('rejects Excel-invalid sheet names', async (t) => {
  const dir = await workspace(t);
  const input = path.join(dir, 'invalid-name.json');
  await writeFile(input, JSON.stringify({ sheets: [{ name: "'Data", rows: [] }] }));
  const result = spawnSync(process.execPath, [script, input], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /sheet name/i);
});

test('rejects text longer than Excel cell limits', async (t) => {
  const dir = await workspace(t);
  const input = path.join(dir, 'too-long.json');
  await writeFile(input, JSON.stringify({ sheets: [{ name: 'Data', rows: [['x'.repeat(32768)]] }] }));
  const result = spawnSync(process.execPath, [script, input], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /32767|32,767/);
});

test('rejects worksheets exceeding the Excel column limit', async (t) => {
  const dir = await workspace(t);
  const input = path.join(dir, 'too-wide.json');
  await writeFile(input, JSON.stringify({ sheets: [{ name: 'Data', rows: [Array(16385).fill(1)] }] }));
  const result = spawnSync(process.execPath, [script, input], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /column/i);
});

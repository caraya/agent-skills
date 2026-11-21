#!/usr/bin/env node
import { readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import XLSX from 'xlsx';

const usage = 'Usage: node create_xlsx.mjs <source.json> [output.xlsx] [--overwrite]';

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) {
    console.log(usage);
    return;
  }
  const overwrite = args.includes('--overwrite');
  const paths = args.filter((arg) => arg !== '--overwrite');
  if (paths.length < 1 || paths.length > 2 ||
      args.filter((arg) => arg === '--overwrite').length > 1 ||
      paths.some((arg) => arg.startsWith('-'))) {
    throw new Error(usage);
  }

  const [input, explicitOutput] = paths;
  const parsed = path.parse(input);
  const output = explicitOutput ?? path.join(parsed.dir, `${parsed.name}.xlsx`);
  const data = JSON.parse(await readFile(input, 'utf8'));
  if (overwrite) {
    const sourceStat = await stat(input);
    let outputStat;
    try {
      outputStat = await stat(output);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    if (outputStat && sourceStat.dev === outputStat.dev && sourceStat.ino === outputStat.ino) {
      throw new Error('The output must not overwrite the source file.');
    }
  }
  if (!data || !Array.isArray(data.sheets) || data.sheets.length === 0) {
    throw new Error('The input must contain a nonempty sheets array.');
  }
  const extraWorkbookKey = Object.keys(data).find((key) => key !== 'sheets');
  if (extraWorkbookKey) throw new Error(`Unsupported workbook property: ${extraWorkbookKey}`);
  const workbook = XLSX.utils.book_new();
  const sheetNames = new Set();
  for (const sheet of data.sheets) {
    if (!sheet || typeof sheet.name !== 'string' || !Array.isArray(sheet.rows)) {
      throw new Error('Each sheet must have a name and a rows array.');
    }
    const extraSheetKey = Object.keys(sheet).find((key) => !['name', 'rows'].includes(key));
    if (extraSheetKey) throw new Error(`Unsupported sheet property: ${extraSheetKey}`);
    const nameKey = sheet.name.toLowerCase();
    if (sheetNames.has(nameKey)) throw new Error(`Duplicate sheet name: ${sheet.name}`);
    sheetNames.add(nameKey);
    if (sheet.rows.length > 1048576) throw new Error(`Sheet "${sheet.name}" exceeds Excel's row limit.`);
    for (const row of sheet.rows) {
      if (!Array.isArray(row)) throw new Error('Each row must be an array.');
      if (row.length > 16384) throw new Error(`Sheet "${sheet.name}" exceeds Excel's column limit.`);
      for (const cell of row) {
        if (cell !== null && !['string', 'number', 'boolean'].includes(typeof cell)) {
          throw new Error('Each cell must be a string, number, boolean, or null.');
        }
        if (typeof cell === 'number' && (!Number.isFinite(cell) ||
            (Number.isInteger(cell) && !Number.isSafeInteger(cell)))) {
          throw new Error('Numeric cells must be finite; integers must be safe integers. Use strings for exact identifiers.');
        }
      }
    }
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(sheet.rows), sheet.name);
  }
  const bytes = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  await writeFile(output, bytes, { flag: overwrite ? 'w' : 'wx' });
  console.log(`Created ${output}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

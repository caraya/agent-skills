import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const [htmlPath, prismTheme = "solarizedlight"] = process.argv.slice(2);
assert.ok(htmlPath, "Usage: node validation-test.mjs <index.html> [prism-theme]");
assert.match(prismTheme, /^[a-z0-9-]+$/i, "Prism theme must be a theme name");

const absoluteHtmlPath = resolve(htmlPath);
const html = readFileSync(absoluteHtmlPath, "utf8");
const body = html.match(/<body\b[^>]*>/i)?.[0];
assert.ok(body, "Presentation must have a body element");
const customStylesheetApproved = /\bdata-custom-stylesheet\s*=\s*["']approved["']/i.test(body);

const stylesheetHrefs = [...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi)].map(([tag]) =>
  tag.match(/\bhref\s*=\s*(["'])(.*?)\1/i)?.[2] ?? "",
);
assert.ok(stylesheetHrefs.some(href => /(?:^|\/)inspire\.css$/.test(href)), "Link Inspire's core stylesheet");

const designStylesheets = stylesheetHrefs.filter(
  href => !/(?:^|\/)inspire\.css$/.test(href) && !/(?:^|\/)prism-[\w-]+\.css$/.test(href),
);
const layoutStylesheetHref = designStylesheets.find(href => href.endsWith("/slide-layout.css"));
assert.ok(layoutStylesheetHref, "Every presentation must link the shared slide layout stylesheet");
const layoutCss = readFileSync(resolve(dirname(absoluteHtmlPath), layoutStylesheetHref), "utf8");
assert.match(layoutCss, /\.slide\s*\{[^}]*\bpadding\s*:/s, "Every slide needs viewport gutters");
assert.match(layoutCss, /\.slide p,\s*\.slide ul,\s*(?:\.slide ol,\s*)?\.slide pre\s*\{[^}]*max-width\s*:/s, "Every presentation needs a readable text width");

for (const href of designStylesheets) {
  const css = readFileSync(resolve(dirname(absoluteHtmlPath), href), "utf8");
  for (const [, selector, declarations] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!customStylesheetApproved && (selector.includes(".slide") || selector.trim() === ":root") && ![".slide details.notes > summary", ".slide details.notes > div"].includes(selector.trim())) {
      assert.doesNotMatch(declarations, /(?:font-size|--slide-base-font-size)\s*:/i, "Keep Inspire's responsive slide type scale");
    }
  }
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"))?.[2] ?? "";
}

function pluginNames(name) {
  return attribute(body, name).split(/[\s,]+/).filter(Boolean);
}

const noteBlocks = [...html.matchAll(/<details\b(?=[^>]*class=(["'])[^"']*\bnotes\b[^"']*\1)[^>]*>([\s\S]*?)<\/details>/gi)];
if (noteBlocks.length) {
  for (const [block, , content] of noteBlocks) {
    const openingTag = block.slice(0, block.indexOf(">") + 1);
    assert.match(openingTag, /\bbottom-(?:left|right)\b/, "Speaker notes must be positioned along the slide bottom");
    assert.match(block, /<details\b[^>]*>\s*<summary\b[^>]*>[\s\S]*?<\/summary>/i, "Speaker notes must have a direct summary child");
  }

  for (const pluginsAttribute of ["data-plugins", "data-load-plugins"]) {
    const plugins = pluginNames(pluginsAttribute);
    assert.ok(plugins.includes("presenter"), `${pluginsAttribute} must include presenter`);
    assert.ok(plugins.includes("details-notes"), `${pluginsAttribute} must include details-notes`);
  }
}

if (noteBlocks.length) {
  const notesPluginPath = resolve(dirname(absoluteHtmlPath), "plugins/details-notes/plugin.js");
  assert.ok(existsSync(notesPluginPath), "Local notes plugin must be present");
  const notesPlugin = readFileSync(notesPluginPath, "utf8");
  assert.match(notesPlugin, /details\.querySelector\(":scope > summary"\)/, "Notes plugin must preserve the direct summary");
  assert.match(notesPlugin, /filter\(node => node !== directSummary\)/, "Notes plugin must wrap only note content");
  const notesStylesheetHref = designStylesheets.find(href => href.endsWith("/slide-layout.css"));
  assert.ok(notesStylesheetHref, "Local notes summary sizing must be linked");
  assert.match(layoutCss, /\.slide details\.notes > summary\s*\{[^}]*font-size:\s*var\(--slide-base-font-size\)/s, "Notes summary must match Inspire's slide text size");
  assert.match(layoutCss, /\.slide details\.notes > div\s*\{[^}]*font-size:\s*var\(--slide-base-font-size\)/s, "Notes panel must match Inspire's slide text size");
}

const hasPrismCode = /<code\b(?=[^>]*\bclass=(["'])[^"']*\blanguage-[\w-]+[^"']*\1)[^>]*>/i.test(html);
if (hasPrismCode) {
  for (const pluginsAttribute of ["data-plugins", "data-load-plugins"]) {
    assert.ok(pluginNames(pluginsAttribute).includes("prism"), `${pluginsAttribute} must include prism`);
  }

  const themeFile = `prism-${prismTheme}.css`;
  const stylesheetLinks = [...html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi)].map(([tag]) => attribute(tag, "href"));
  const themeHref = stylesheetLinks.find(href => href.endsWith(themeFile));
  assert.ok(themeHref, `Link the Prism theme ${themeFile}`);
  assert.ok(!/^https?:\/\//i.test(themeHref), "Prism theme must be local for offline use");
  assert.ok(existsSync(resolve(dirname(absoluteHtmlPath), themeHref)), `Missing local Prism theme: ${themeHref}`);
}

const hasGrid = /class=["'][^"']*\bslide-grid\b/.test(html);

if (!customStylesheetApproved) {
  const designStylesheetNames = designStylesheets.map(href => href.split(/[\\/]/).at(-1));
  assert.deepEqual(designStylesheetNames, ["slide-layout.css", ...(hasGrid ? ["grid-layouts.css"] : [])], "Every deck gets baseline layout CSS; grid CSS stays conditional");
}

if (hasGrid) {
  const gridStylesheetHref = designStylesheets.find(href => href.endsWith("/grid-layouts.css"));
  assert.ok(gridStylesheetHref, "Link the local grid layout stylesheet when the deck uses grids");
  const gridCss = readFileSync(resolve(dirname(absoluteHtmlPath), gridStylesheetHref), "utf8");
  assert.match(gridCss, /\.slide-grid\s*\{[^}]*\bdisplay\s*:\s*grid/s, "Grid stylesheet must create grid columns");
}

console.log("Presentation validation passed: grid layout, slide spacing, Prism theme, and speaker-note placement.");

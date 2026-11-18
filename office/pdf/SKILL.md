---
name: pdf
description: Creates a PDF from specified source material using pdf-lib. In Copilot, use the active editor document as the source when none is specified.
---

# PDF document builder

Create a readable PDF from the user's source using JavaScript and `pdf-lib`. In Copilot, the source defaults to the open document in the editor, not the chat transcript.

## When to use

- The user asks to create, export, or generate a PDF from a document, text, or other specified source.
- The user asks for an open document to be turned into a PDF.

## Workflow

1. **Resolve the source.** Use the explicitly named source when provided. Otherwise, in Copilot, read the full active editor document through the available editor or workspace context. Use only a selected range when the user asks for that range. If there is no active document or its contents are unavailable, ask the user to identify or provide the source; never invent or silently substitute content. If multiple documents could be the source, clarify which one.
2. **Choose the output.** Save beside a named source using the same base name and a `.pdf` extension. For an unsaved document, ask for an output location. Do not overwrite an existing file without permission; choose a non-conflicting name or ask. Do not change the source document.
3. **Plan the layout.** Preserve the source's meaning, order, and useful structure, such as headings, lists, and tables. Follow the user's layout requests. Otherwise use a simple, readable design with consistent margins, typography, and spacing; choose page dimensions from the source or request, defaulting to Letter. Do not claim exact visual conversion of formats that `pdf-lib` cannot lay out.
4. **Build the PDF.** For UTF-8 plain text or basic Markdown, use the bundled `scripts/create_pdf.mjs` CLI. It uses a top-level YAML frontmatter `title` as the PDF metadata title, removes frontmatter from the rendered body, wraps text, paginates, and verifies that the saved bytes can be loaded. Without a frontmatter title, it falls back to the first Markdown heading and then the output filename. The CLI resolves dependencies from this skill package, not the target project. If they are not installed, run `npm ci` in the skill package directory containing its `package.json`; do this once, not for each target project. For source code files, wrap the full contents in a single fenced code block labeled with the file's language, prefix a heading with the file name, and pass that Markdown to the CLI via standard input. Mermaid rendering requires Node.js 22 or later. If Node.js is older than 22 and the source contains Mermaid fences, tell the user diagrams will be rendered as plain Mermaid source, and ask whether to proceed or upgrade Node first. The CLI does not convert Word or HTML files faithfully; read their contents and lay them out explicitly with `pdf-lib`. Use `PDFDocument.load()` when the source is already a PDF and the requested operation is editing or adding pages.
5. **Use the CLI.** For a saved source file, run:

   ```sh
   node /path/to/pdf/scripts/create_pdf.mjs source.md output.pdf
   ```

   The output argument is optional; by default the PDF is saved beside the source with the same base name. For an open but unsaved document, pass its exact UTF-8 contents through standard input (`-`) or a temporary source file; do not put document contents in shell arguments. The CLI accepts `--page-size a4|letter` and `--font <font-file>`. It refuses to overwrite an existing output.
6. **Know the CLI limits.** The CLI preserves basic Markdown headings, paragraphs, lists, quotes, and fenced code blocks. Known fence languages are syntax-highlighted with the Prism.js Solarized Light theme; unlabeled or unknown languages remain plain monospace. Mermaid fences are rendered to SVG, rasterized to PNG, and embedded in the PDF, so they appear as diagrams rather than Mermaid source; this is raster output, not vector. Markdown image references are represented by their alt text and URL, not embedded pixels. If the user expects other images, elaborate tables, or precise styling, build those elements explicitly with `pdf-lib`'s drawing and image APIs or explain the limitation; never silently imply they were preserved.
7. **Handle fonts and assets.** Standard fonts are suitable for basic Latin text. For characters they cannot encode, pass a suitable licensed font with `--font`; `@pdf-lib/fontkit` is included in the skill package dependencies. If no suitable font file is present in the workspace or system font directories, ask the user to provide one; do not download fonts or invent a font path, and do not proceed while silently dropping characters. The CLI reports unsupported standard-font characters instead of dropping them. Embed requested images with the appropriate `pdf-lib` image API.
8. **Verify and report.** Confirm the output exists and is non-empty. If a PDF viewer or renderer is available, inspect for clipping, missing glyphs, and awkward page breaks. Report the output path and any fidelity limitation; do not claim a visual or content check that was not performed.

## CLI reference

```text
node scripts/create_pdf.mjs <source.md|txt|-> [output.pdf] [options]

Options:
  --page-size a4|letter
  --font <font-file>
  -h, --help
```

Run `npm test` in this skill directory to test the CLI.

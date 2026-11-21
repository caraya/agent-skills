---
name: word
description: Converts the active or specified Markdown document to a Word DOCX file, embedding Mermaid diagrams as images.
compatibility: Requires Node.js 22 or later and npm. No Microsoft Word installation or network access is needed for document generation after dependencies are installed.
---

# Markdown to Word

Convert a Markdown document to a `.docx` file using the bundled Node.js CLI and `docx` package. The package creates the complete Office Open XML document, relationships, styles, and content types. Mermaid diagrams are rendered to PNG images and embedded in the document.

## Workflow

1. **Resolve the source.** Use the explicitly named Markdown source when provided. Otherwise, in Copilot, use the currently open Markdown document and read its full contents through the available editor or workspace context. If there is no active Markdown document or its contents are unavailable, ask the user to identify or provide the source. If the document is unsaved, ask the user to save it as a `.md` file first. Do not substitute the chat transcript or invent content.
2. **Choose the output.** Save beside the source using the same base name and a `.docx` extension. Do not overwrite an existing file; ask for a different output path. Do not modify the source.
3. **Install dependencies once.** The CLI resolves dependencies from this skill package, not the user's project. If dependencies are missing, locate the installed skill directory containing this `SKILL.md` and `package.json`, then run:

   ```sh
   npm ci --prefix /path/to/word
   ```

   Do this once for the skill installation, not for each project. Before installing dependencies or running the CLI, check `node --version` and `npm --version`. If Node.js is missing or older than 22, or npm is missing, stop and tell the user to install Node.js 22+ and npm; do not attempt the conversion or fall back to another tool.
4. **Generate the document.**

   ```sh
   node /path/to/word/scripts/create_docx.mjs source.md output.docx
   ```

   The output argument is optional and defaults to the source path with a `.docx` extension. The CLI refuses to overwrite an existing output and reports errors rather than silently dropping unsupported content. If the CLI exits with an error, quote the error message to the user, identify the offending Markdown construct and line if reported, and ask whether to remove or replace it in a temporary copy or abort. Do not retry with altered content without approval.
5. **Verify and report.** Confirm the output exists and is non-empty. Report its path and any conversion limitations. Do not claim a visual inspection unless a Word-compatible viewer was used.

## Markdown support

- YAML frontmatter is excluded from the document body. A nonempty string `title` becomes the first Heading 1, without duplicating an identical opening Heading 1. Without a title, no extra heading is added. Invalid YAML or a non-string title produces an error.
- Headings, paragraphs, bold, italic, strikethrough, inline code, HTTP(S) and email links, lists, block quotes, tables, and horizontal rules are converted to Word structures.
- Fenced code is preserved in a monospace font. `mermaid` and `mmd` fences are rendered as PNG images and embedded in the DOCX.
- Local PNG and JPEG Markdown images are embedded with their alt text. Remote images are rejected; download them only if the user explicitly requests it and approves the source.
- Unsupported Markdown constructs and non-PNG/JPEG images produce an error. Do not remove content to make conversion succeed without the user's approval. If the user approves removing or replacing content, write a modified copy of the Markdown to a temporary file, convert that copy with the chosen output path, and leave the original source untouched. Adjust image paths in the copy so existing local images still resolve relative to the original source and approved downloaded images resolve to their local files. Tell the user which changes were made in the copy.

## CLI

```text
node scripts/create_docx.mjs <source.md> [output.docx]

Options:
  -h, --help    Show usage
```

Run `npm test` in this skill directory to test the converter.

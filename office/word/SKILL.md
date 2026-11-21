---
name: word
description: Converts the active or specified Markdown document to a Word DOCX file, optionally using a DOCX template and embedding Mermaid diagrams as images.
compatibility: Requires Node.js 22 or later and npm. No Microsoft Word installation or network access is needed for document generation after dependencies are installed.
---

# Markdown to Word

Convert a Markdown document to a `.docx` file using the bundled Node.js CLI and `docx` package. The package creates the complete Office Open XML document, relationships, styles, and content types. Mermaid diagrams are rendered to PNG images and embedded in the document.

## Workflow

1. **Resolve the source.** Use the explicitly named Markdown source when provided. Otherwise, in Copilot, use the currently open Markdown document and read its full contents through the available editor or workspace context. If there is no active Markdown document or its contents are unavailable, ask the user to identify or provide the source. If the document is unsaved, ask the user to save it as a `.md` file first. Do not substitute the chat transcript or invent content.
2. **Choose the output and template.** Save beside the source using the same base name and a `.docx` extension. Do not overwrite an existing file; ask for a different output path. If the user supplies a document template, use that `.docx` with `--template`. If they request a template without naming one, ask whether to use the bundled `templates/starter.docx` or another template. Otherwise create a new document without a template. Do not modify the source or template.
3. **Install dependencies once.** The CLI resolves dependencies from this skill package, not the user's project. If dependencies are missing, locate the installed Word skill's actual directory containing this `SKILL.md`, `package.json`, and `package-lock.json`, then run:

   ```sh
   npm ci --prefix "/path/to/word" --workspaces=false
   ```

   Replace the placeholder with that absolute skill directory, not the caller's working directory or project root. Do this once for the skill installation, not for each project. Use this command even when the skill is inside a monorepo; do not install from the repository root. Before installing dependencies or running the CLI, check `node --version` and `npm --version`. If Node.js is missing or older than 22, or npm is missing, stop and tell the user to install Node.js 22+ and npm; do not attempt the conversion or fall back to another tool.
4. **Generate the document.**

   ```sh
   node /path/to/word/scripts/create_docx.mjs source.md output.docx
   ```

   The output argument is optional and defaults to the source path with a `.docx` extension. The CLI refuses to overwrite an existing output and reports errors rather than silently dropping unsupported content. If the CLI exits with an error, quote the error message to the user, identify the offending Markdown construct and line if reported, and ask whether to remove or replace it in a temporary copy or abort. Do not retry with altered content without approval.
   To use a supplied template, append `--template "/path/to/template.docx"`. Quote paths containing spaces. The template must contain exactly one standalone `{{content}}` paragraph directly in the main document body, not in a table, header, footer, bookmark, or content control. The marker may be split across plain text runs, but its paragraph must contain no other content, fields, images, or section break. If template validation fails, report the error and ask the user to provide a corrected template; do not silently alter the template or fall back to a blank document.
5. **Verify and report.** Confirm the output exists and is non-empty. Report its path and any conversion limitations. Do not claim a visual inspection unless a Word-compatible viewer was used.

## Markdown support

- YAML frontmatter is excluded from the document body. A nonempty string `title` becomes the first Heading 1, without duplicating an identical opening Heading 1. Without a title, no extra heading is added. Invalid YAML or a non-string title produces an error.
- Headings, paragraphs, bold, italic, strikethrough, inline code, HTTP(S) and email links, lists, block quotes, tables, and horizontal rules are converted to Word structures.
- Inline and fenced code use the template's `Code` character style when present; otherwise they use Consolas. The bundled starter template uses embedded Ubuntu Mono for that style. Fenced code is not syntax-highlighted with Prism. `mermaid` and `mmd` fences are rendered as PNG images and embedded in the DOCX.
- Local PNG and JPEG Markdown images are embedded with their alt text. Remote images are rejected; download them only if the user explicitly requests it and approves the source.
- Unsupported Markdown constructs and non-PNG/JPEG images produce an error. Do not remove content to make conversion succeed without the user's approval. If the user approves removing or replacing content, write a modified copy of the Markdown to a temporary file, convert that copy with the chosen output path, and leave the original source untouched. Adjust image paths in the copy so existing local images still resolve relative to the original source and approved downloaded images resolve to their local files. Tell the user which changes were made in the copy.

## Document templates

The bundled [starter template](templates/starter.docx) uses Google Sans with a 12 pt body-text baseline, scaled headings, Letter pages with 1-inch margins, and a centered "Page X of Y" footer. Its `Code` character style uses Ubuntu Mono for inline and fenced code. Resolve the template's path relative to this installed skill directory, not the caller's working directory. It embeds complete regular, bold, italic, and bold-italic faces of both font families from the supplied sibling `fonts` directory. Google Sans uses the SIL Open Font License; Ubuntu Mono uses the [Ubuntu Font Licence 1.0](templates/UbuntuMono-LICENSE.txt), included inside the template package. The template is self-contained; do not require source font files or local font installations to generate documents from it. Font rendering depends on whether the viewer supports Word's embedded fonts.

The CLI replaces the marker paragraph with the converted Markdown. The frontmatter title remains the first inserted Heading 1, without duplicating a matching opening Heading 1. It preserves the template's surrounding content, sections, margins, headers, footers, page-number fields, and embedded fonts. Content insertion can change pagination; check the result in a Word-compatible viewer.

Generated paragraphs use the template's default paragraph style. Headings reuse its `Heading1` through `Heading6` style IDs; missing heading styles receive defaults. Inline and fenced code reuse its `Code` character style when defined. Inline emphasis and explicit table formatting are retained. Images, links, and list numbering are added without replacing existing template resources.

Only `.docx` templates with this single text insertion marker are supported. `.dotx`, macro-enabled templates, multiple insertion regions, bookmark or content-control insertion, and other placeholder substitutions are not supported.

## CLI

```text
node scripts/create_docx.mjs <source.md> [output.docx] [--template template.docx]

Options:
  --template <template.docx>    Insert into a DOCX template
  -h, --help                   Show usage
```

Run `npm test` in this skill directory to test the converter.

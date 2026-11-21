# Word skill

This skill converts a Markdown file into a Word `.docx` document. It uses a
bundled Node.js CLI; Microsoft Word is not required.

## Requirements

Install Node.js 22 or later and npm. In this repository, the skill is an npm
workspace; install its dependencies from the repository root:

```sh
npm install
```

When invoking the skill, run
`npm ci --prefix "/path/to/word" --workspaces=false` once if dependencies
are missing. Replace the placeholder with the installed Word skill's
absolute directory containing `SKILL.md`, `package.json`, and
`package-lock.json`, not the caller's working directory or project root.
Use this skill-local command even inside a monorepo; the repository-root
installation above is for monorepo development only.

After installation, document generation does not require network access.

## Skill workflow

Ask the agent to convert a Markdown file to Word. It uses the specified file
or, in Copilot, the active Markdown document. An unsaved document must be saved
first.

By default, the skill writes a `.docx` beside the source with the same base
name. It leaves the source unchanged and asks for another output path if the
destination already exists. It checks that the output exists and is non-empty
and reports any conversion limitations.

If conversion fails, the skill reports the error. With your approval, it can
make a temporary copy with problematic content removed or replaced and
convert that copy, while preserving the original. Downloading remote images
also requires your explicit request and approval of the source.

## CLI usage

From the skill directory, run:

```sh
node scripts/create_docx.mjs source.md output.docx
```

Replace the example paths with your own. The output argument is optional; if
omitted, the CLI replaces the source's `.md` extension with `.docx`. Paths are
resolved relative to the current working directory. The source must have a
`.md` extension, and the CLI refuses to overwrite an existing output.

Run `node scripts/create_docx.mjs --help` for usage. On success, the CLI prints
the output path; on failure, it prints an error and exits with a nonzero status.

## Document templates

The bundled [starter template](templates/starter.docx) provides a minimal
Letter-size report layout with 1-inch margins, Google Sans at 12 pt for body
text, headings at 20, 16, 14, 13, 12, and 12 pt, and a centered 10 pt
"Page X of Y" footer. Its regular, bold, italic, and bold-italic Google Sans
faces are embedded in full, not subsetted. A viewer that supports Word font
embedding can use them without a local Google Sans installation.

The embedded static faces were derived from the supplied variable fonts in
[the sibling fonts directory](../fonts/) at weights 400 and 700, with optical
size 18 and grade 0. The originals are unchanged and licensed under the
[SIL Open Font License](../fonts/OFL.txt). The template is self-contained;
its source font files are not needed when generating a document from it.
Template conversion preserves the embedded font files and their relationships.

From the skill directory, use it with:

```sh
node scripts/create_docx.mjs source.md output.docx --template templates/starter.docx
```

To use existing letterhead or a report layout:

1. Create a `.docx` document in Word or another compatible editor.
2. Put `{{content}}` in its own paragraph where the generated content belongs.
   Place that paragraph directly in the main document body, not in a table,
   header, footer, bookmark, or content control. Include no other content,
   fields, images, or section break in that paragraph.
3. Save the template and run:

   ```sh
   node scripts/create_docx.mjs source.md output.docx --template "company template.docx"
   ```

Replace the paths with your files. Relative paths resolve from the caller's
working directory. There must be exactly one `{{content}}` marker across
the template's paragraph text. The marker can span multiple plain text runs,
as often happens when editing in Word. Missing, repeated, or misplaced
markers cause an error; the converter does not fall back to a blank document.

The generated Markdown replaces only the marker paragraph. Its frontmatter
title becomes the first inserted Heading 1, without duplicating a matching
opening Heading 1; frontmatter itself is not rendered. Surrounding content,
sections, margins, headers, footers, and page-number fields are preserved.
Neither the source nor the template is modified, and existing output files
are never overwritten.

Body paragraphs use the template's default paragraph style. Headings reuse
the template's `Heading1` through `Heading6` style IDs, with defaults added
for missing heading styles. Inline emphasis, monospace code, and explicit
table formatting remain. Generated images, links, and list numbering are
merged with the template's resources without identifier collisions.

This initial support does not accept `.dotx` or macro-enabled templates,
multiple insertion regions, bookmark or content-control insertion, or other
placeholder substitutions. Pagination can change when content is inserted.
Inspect important documents in a Word-compatible viewer.

## Conversion and limitations

The CLI parses Markdown with `marked` and builds the document with `docx`.
It excludes YAML frontmatter from the document body and uses a nonempty
string `title` as the first Heading 1, without duplicating an identical
opening Heading 1. Without a title, it adds no extra heading. Invalid YAML
or a non-string title produces an error.
It supports headings, paragraphs, bold, italic, strikethrough, inline code,
HTTP(S) and email links, lists, block quotes, tables, horizontal rules, and
code blocks. Fenced `mermaid` and `mmd` diagrams are rendered as PNG images
and embedded in the document.

Local PNG and JPEG images are embedded with their alt text. Image paths are
resolved relative to the Markdown file. Remote images, other image formats,
and unsupported constructs produce an error rather than being silently
dropped. Raw HTML is valid Markdown, but the converter does not support
translating it into Word content and rejects it.

## Tests

Run the converter tests from the skill directory with `npm test`, or from the
repository root:

```sh
npm test --workspace=office/word
```

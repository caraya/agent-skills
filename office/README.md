# Experimental Office Skills

> These skills are HIGHLY EXPERIMENTAL and may change frequently.

These skills create PDF, Word and PowerPoint documents from Markdown.
Each skill is an npm workspace in the monorepo. Run `npm install` from the
repository root to install dependencies for all workspaces, then run a
skill's tests with `npm test --workspace=office/<skill>`.

Each skill keeps its own `package-lock.json` so it can also be installed on
its own. npm applies `overrides` only from the root manifest, so overrides in
a skill's `package.json` must also be added to the root `package.json`.

## Skills

- [PDF](pdf/SKILL.md) converts Markdown to PDF.
- [Word](word/SKILL.md) converts Markdown to Word `.docx`.
- [PowerPoint](powerpoint/SKILL.md) converts Markdown to PowerPoint `.pptx`.

## Install skills

From the project where you want to use a skill, list a local package with:

```sh
npx skills add /path/to/agent-skills/office/pdf --list
npx skills add /path/to/agent-skills/office/word --list
npx skills add /path/to/agent-skills/office/powerpoint --list
```

Or install from GitHub:

```sh
npx skills add https://github.com/caraya/agent-skills/tree/main/office/pdf
npx skills add https://github.com/caraya/agent-skills/tree/main/office/word
npx skills add https://github.com/caraya/agent-skills/tree/main/office/powerpoint
```

Remove `--list` to select and install a skill. Replace `/path/to/agent-skills`
with the path to your checkout when installing locally. An installed copy
outside this repository needs its own dependencies; run
`npm ci --prefix /path/to/installed/skill` once.

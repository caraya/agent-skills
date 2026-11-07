# Agent Skills Repository

This repository contains reusable agent instructions and Agent Skills for Claude
Code and VS Code. Keep the source layout canonical; platform-specific discovery is
configured in each tool rather than maintained through duplicated prompt files.

## Source layout

- `agents/<agent-name>/agent.md` contains an agent prompt with YAML frontmatter.
- `agents/<agent-name>/agent.json`, when present, contains supplementary metadata.
- `skills/<skill-name>/SKILL.md` contains an Agent Skill with `name` and
  `description` frontmatter. Skill names must match their directory names.
- Skill references, scripts, and assets stay alongside their owning `SKILL.md`.
- `references/` contains shared supporting material.

## Agents

- `content-editor` reviews technical content across correctness, architecture,
  readability, code examples, and style.
- `content-ideation` drafts structured Markdown from text or a URL.
- `content-summarizer` produces variable-length summaries from URLs.
- `instructional-designer-dev-content` plans developer learning experiences.
- `polyglot-engineering` scaffolds projects and implements features across the
  supported languages.
- `polyglot-performance` measures bottlenecks and recommends optimizations.
- `presentation-builder` creates offline-ready Inspire.js presentations.

## Core conventions

- Implement first. `polyglot-engineering` defaults to implementation; switch to
  review mode only when explicitly requested.
- Format last, using the relevant language skill.
- Ask for guidance when blocked instead of guessing.
- Do not auto-chain content workflows. `content-ideation` and `content-editor`
  are independent stages; the human chooses when to run each.
- Keep orchestration agents language-agnostic and put language-specific depth in
  skills.

## Claude Code

`.claude-plugin/plugin.json` is the Claude Code plugin manifest. It explicitly
registers the skill directory and each agent prompt because agents are stored in
per-agent subdirectories. Keep manifest paths relative to the repository root.
The plugin can be loaded locally with `claude --plugin-dir .`.

Do not add API endpoint definitions to `plugin.json`. Claude Code plugin commands
are Markdown files, not HTTP handlers; this repository does not include a handler
server.

## VS Code

`.vscode/settings.json` points VS Code to the canonical `skills/` directory and
each agent prompt directory. Keep those paths synchronized with additions or
renames under `agents/` and `skills/`. This allows VS Code to discover the current
layout without copying prompts into platform-specific folders.

## Authoring and validation

- Keep agent and skill instructions tool-agnostic where possible. Put platform
  discovery details in the manifest or editor settings, not in shared prompts.
- Use relative links for resources within a skill, and repository-relative paths
  for resources shared across agents and skills.
- Preserve the `SKILL.md` filename and required `name` and `description`
  frontmatter fields.
- Validate agent and skill frontmatter with `npm run validate:frontmatter`, and
  validate skill names with `node scripts/validate_skills.cjs`.
- When changing agent names or locations, update the Claude manifest and VS Code
  settings in the same change.

## References

- `references/accessibility-checklist.md` is the WCAG 2.1 AA checklist.
- `references/accessible-component-generation.md` covers accessible component
  generation.

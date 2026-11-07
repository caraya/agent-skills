# Agent Skills Repository

Reusable agents and [Agent Skills](https://agentskills.io/) for AI-assisted
development, content work, instructional design, and interface design.

## Repository layout

| Path | Purpose |
| --- | --- |
| `agents/<name>/agent.md` | Agent prompt and YAML metadata |
| `skills/<name>/SKILL.md` | Portable Agent Skill instructions |
| `references/` | Shared reference documents |
| `.claude-plugin/plugin.json` | Claude Code plugin manifest |
| `.vscode/settings.json` | VS Code discovery paths for the canonical agents and skills |

Agent prompts are grouped into per-agent directories. Skills follow the Agent
Skills convention: one directory per skill, containing `SKILL.md` with matching
`name` and directory name, plus a description of when to use it.

## Use with Claude Code

The plugin manifest explicitly registers the skills directory and agent prompts.
From this repository, load the plugin locally with:

```sh
claude --plugin-dir .
```

The manifest uses Claude Code's native plugin component paths. It does not define
HTTP handlers; no command server is included in this repository.

## Use with VS Code

Workspace settings point to the existing `skills/` directory and individual
agent directories, so prompts do not need to be duplicated under `.github/`.
When adding or renaming an agent or skill, update `.vscode/settings.json`.

## Validation

```sh
npm run validate:frontmatter
node scripts/validate_skills.cjs
```

Claude Code's CLI can also validate the plugin manifest:

```sh
claude plugin validate .
```

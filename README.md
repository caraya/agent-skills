# Agent Skills Monorepo

This repository uses npm workspaces for the `coding` and `instructional-design`
packages and for the experimental [PDF](office/pdf/SKILL.md),
[Word](office/word/SKILL.md), [PowerPoint](office/powerpoint/SKILL.md), and
[Excel](office/excel/SKILL.md) skills in `office/`. The `rw-mcp` Go module
and the frontend template are independent.

Install workspace dependencies from the root:

```sh
npm install
```

Run a package script from the root with `npm run <script> --workspace=<path>`,
for example `--workspace=coding` or `--workspace=office/pdf`. Use
`--workspaces` to run a script in every workspace. To test the office skills:

```sh
npm test --workspace=office/pdf --workspace=office/word --workspace=office/powerpoint --workspace=office/excel
```

The root `package-lock.json` records the monorepo installation; the existing
package lockfiles support independent installations of those packages. npm
applies `overrides` only from the root manifest, so the office skills'
dependency overrides are repeated in the root `package.json`. Keep both
copies in sync when changing them.

## Install skills

From the project where you want to use the skills, list the skills in either
local package:

```sh
npx skills add /path/to/agent-skills/coding/skills --list
npx skills add /path/to/agent-skills/instructional-design/skills --list
npx skills add /path/to/agent-skills/office/pdf --list
npx skills add /path/to/agent-skills/office/word --list
npx skills add /path/to/agent-skills/office/powerpoint --list
npx skills add /path/to/agent-skills/office/excel --list
```

Replace `/path/to/agent-skills` with the path to your checkout. Remove `--list`
to select and install skills. Add `--global` to install them for use across
projects.

You can also install from either package's skills directory on GitHub:

```sh
npx skills add https://github.com/caraya/agent-skills/tree/main/coding/skills
npx skills add https://github.com/caraya/agent-skills/tree/main/instructional-design/skills
npx skills add https://github.com/caraya/agent-skills/tree/main/office/pdf
npx skills add https://github.com/caraya/agent-skills/tree/main/office/word
npx skills add https://github.com/caraya/agent-skills/tree/main/office/powerpoint
npx skills add https://github.com/caraya/agent-skills/tree/main/office/excel
```

Some skill names occur in both packages. When discovering both packages together,
the CLI keeps only the first matching name, so use a package-specific path to
select the intended version. The experimental office skills are installed
individually from their package directories. An installed office skill outside
this repository needs its own dependencies; run `npm ci --prefix
/path/to/installed/skill` once.

The `skills` CLI installs skills into supported coding agents; it does not install
the agent definitions in this repository. See the [skills CLI reference](https://github.com/vercel-labs/skills/blob/main/docs/commands.md)
for installation options.

## Install agents

### Project workspace

Download an agent into your project's `.github/agents` directory. For example,
run this from your project to install the content editor:

```sh
mkdir -p .github/agents
curl -fsSL https://raw.githubusercontent.com/caraya/agent-skills/main/coding/agents/content-editor/agent.md -o .github/agents/content-editor.agent.md
```

Select the agent from the VS Code chat agent dropdown. Repeat the download to
update it; the command overwrites the existing file. Other agents can be
downloaded from their own `agent.md` paths in `coding/agents` or
`instructional-design/agents`.

### Claude Code user account

To make the content editor available across projects in Claude Code:

```sh
mkdir -p "$HOME/.claude/agents"
curl -fsSL https://raw.githubusercontent.com/caraya/agent-skills/main/coding/agents/content-editor/agent.md -o "$HOME/.claude/agents/content-editor.md"
```

If the `agents` directory did not exist when Claude Code started, restart the
session so it discovers the agent.

### GitHub Copilot user account

To make the content editor available across projects in the Copilot harness:

```sh
mkdir -p "$HOME/.copilot/agents"
curl -fsSL https://raw.githubusercontent.com/caraya/agent-skills/main/coding/agents/content-editor/agent.md -o "$HOME/.copilot/agents/content-editor.agent.md"
```

In VS Code, select the Copilot harness to use agents from this directory.

Repeat the corresponding download to update an agent. These commands overwrite existing files with the same name.

Install any skills referenced by an agent separately. Some agents contain links to repository files; those links may need adjustment in the downloaded copy.

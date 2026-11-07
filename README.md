# Agent Skills Monorepo

This repository uses npm workspaces for the `coding` and `instructional-design`
packages. The `rw-mcp` Go module and the frontend template are independent.

Install workspace dependencies from the root:

```sh
npm install
```

Run a package script from the root with `npm run <script> --workspace=coding`
or `npm run <script> --workspace=instructional-design`. Use `--workspaces` to
run a script in every workspace.

The root `package-lock.json` records the monorepo installation; the existing
package lockfiles support independent installations of those packages.

## Install skills

From the project where you want to use the skills, list the skills in either
local package:

```sh
npx skills add /path/to/agent-skills/coding/skills --list
npx skills add /path/to/agent-skills/instructional-design/skills --list
```

Replace `/path/to/agent-skills` with the path to your checkout. Remove `--list`
to select and install skills. Add `--global` to install them for use across
projects.

When the repository is hosted on GitHub, you can also use a URL for either
package's skills directory:

```sh
npx skills add https://github.com/OWNER/REPO/tree/main/coding/skills
npx skills add https://github.com/OWNER/REPO/tree/main/instructional-design/skills
```

Replace `OWNER`, `REPO`, and `main` with the repository owner, name, and branch.
Some skill names occur in both packages. When discovering both packages together,
the CLI keeps only the first matching name, so use a package-specific path to
select the intended version.

The `skills` CLI installs skills into supported coding agents; it does not install
the agent definitions in this repository. See the [skills CLI reference](https://github.com/vercel-labs/skills/blob/main/docs/commands.md)
for installation options.

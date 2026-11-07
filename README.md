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

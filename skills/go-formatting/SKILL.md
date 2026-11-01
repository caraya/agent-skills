---
name: go-formatting
description: "Go formatting skill for gofmt, goimports, and IDE configuration. Trigger phrases: format Go, gofmt, goimports, code style, linting, format on save, golangci-lint."
---

# Go Formatting

## Use When

- Setting up or validating code formatting for Go projects.
- Configuring gofmt, goimports, and linters.
- Integrating formatting into IDE or pre-commit hooks.

## Standard Formatters

1. **gofmt** (built-in)
- Go's standard formatter; enforced by convention.
- No configuration needed; opinionated about style.
- Run: `gofmt -w .` to format in place.

2. **goimports** (import management)
- Extends gofmt to organize imports and add missing dependencies.
- Removes unused imports automatically.
- Install: `go install golang.org/x/tools/cmd/goimports@latest`.
- Run: `goimports -w .` to format and organize imports.

3. **golangci-lint** (comprehensive linting)
- Aggregates multiple linters; catches style and logical issues.
- Can auto-fix many issues with `--fix` flag.
- Install (v2): `go install github.com/golangci/golangci-lint/v2/cmd/golangci-lint@latest`.

## Configuration

### `.golangci.yml` (golangci-lint):
```yaml
version: "2"
linters:
  enable:
    - govet
    - errcheck
    - staticcheck
    - unused

formatters:
  enable:
    - gofmt
    - goimports
  settings:
    gofmt:
      simplify: false
    goimports:
      local-prefixes:
        - "<module-path>"
```

### VS Code `.vscode/settings.json`:
```json
{
  "[go]": {
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll": true
    },
    "editor.defaultFormatter": "golang.go"
  },
  "gopls": {
    "formatting.local": "<module-path>"
  },
  "go.lintOnSave": "package",
  "go.lintTool": "golangci-lint"
}
```
If gopls is disabled (`"go.useLanguageServer": false`), use `"go.formatTool": "goimports"` with `"go.formatFlags": ["-local", "<module-path>"]` instead.

## Checklist

1. Consistency
- gofmt baseline is applied (Go convention).
- goimports is used to manage imports.
- golangci-lint is configured and shared with team.

2. IDE integration
- Format-on-save is enabled in VS Code.
- Go extension is installed and active.

3. Pre-commit hooks
- Use `pre-commit` framework or git hooks to run gofmt and goimports.
- Prevents unformatted code from entering the repository.
- For a check-only git hook, save the following as `.git/hooks/pre-commit`, replace `<module-path>` with the module path from `go.mod`, and enable it with `chmod +x .git/hooks/pre-commit`. It checks the working tree without rewriting files; if it fails, format and stage the changes before retrying the commit.

```sh
#!/bin/sh
gofmt_files=$(gofmt -l .) || exit 1
goimports_files=$(goimports -local '<module-path>' -l .) || exit 1
if [ -n "$gofmt_files$goimports_files" ]; then
  printf '%s\n' 'Format and stage these files before committing:' \
    "$gofmt_files" "$goimports_files" >&2
  exit 1
fi
exit 0
```

4. Import organization
- goimports automatically removes unused imports.
- Imports are grouped: stdlib, third-party, local.
- To get a separate local group, run `goimports -local <module-path> -w .` and set `formatters.settings.goimports.local-prefixes: ["<module-path>"]` in `.golangci.yml`; in VS Code, set `"gopls": { "formatting.local": "<module-path>" }`. If gopls is disabled (`"go.useLanguageServer": false`), use `"go.formatTool": "goimports"` with `"go.formatFlags": ["-local", "<module-path>"]` instead.

## Formatting Rules

- Indentation: Tabs (Go standard, not spaces).
- Line width: No hard limit; keep readable (convention is ~80 chars for exported docs).
- Naming: camelCase for functions and variables, PascalCase for exported symbols.
- Brackets: Opening bracket stays on same line as declaration (Go convention).

## Common Commands

- Format: `gofmt -w .`.
- Format and organize imports: `goimports -w .`.
- Check formatting: `gofmt -d .` (shows diffs without changing files).
- Lint: `golangci-lint run ./...`.
- Lint and fix: `golangci-lint run --fix ./...`.

## Output Requirements

When setting up or validating formatting, provide:
- Formatter versions and configuration.
- IDE integration status.
- Pre-commit hook setup summary.
- Any conflicts or inconsistencies found.

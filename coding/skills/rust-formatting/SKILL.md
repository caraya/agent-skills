---
name: rust-formatting
description: "Rust formatting skill for rustfmt, Clippy, and IDE configuration. Trigger phrases: format Rust, rustfmt, Clippy, code style, format on save, cargo fmt, linting, edition."
---

# Rust Formatting

## Use When

- Setting up or validating code formatting for Rust projects.
- Configuring rustfmt and Clippy for consistent style.
- Integrating formatting into the IDE or pre-commit hooks.

## Standard Formatters

1. **rustfmt** (built-in, recommended)
- Rust's official formatter; part of the standard toolchain.
- Install: `rustup component add rustfmt`.
- Run: `cargo fmt` to format all files in the workspace.

2. **Clippy** (linting)
- Official Rust linter; catches idiomatic and correctness issues.
- Install: `rustup component add clippy`.
- Run: `cargo clippy -- -D warnings` to treat warnings as errors.

## Configuration

### `rustfmt.toml` (project root):
```toml
edition = "2021"
max_width = 100
tab_spaces = 4
use_small_heuristics = "Default"
imports_granularity = "Crate"
group_imports = "StdExternalCrate"
```

Note: `imports_granularity` and `group_imports` are unstable options and are ignored on stable rustfmt. Either run `cargo +nightly fmt`, or omit these keys when the project uses the stable toolchain and verify that `cargo fmt` emits no 'unstable features' warnings.

### `Cargo.toml` (Clippy lints, requires Rust 1.74+):
```toml
[lints.clippy]
unwrap_used = "deny"
expect_used = "warn"
```

Enable `pedantic` and `nursery` only if the team opts in; `nursery` lints are unstable and may produce false positives. Resolve or explicitly allow existing warnings before enforcing `-- -D warnings` in CI.

### VS Code `.vscode/settings.json`:
```json
{
  "[rust]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "rust-lang.rust-analyzer"
  },
  "rust-analyzer.check.command": "clippy",
  "rust-analyzer.rustfmt.extraArgs": []
}
```

## Checklist

1. Consistency
- `rustfmt` is configured with a `rustfmt.toml` that matches team preferences.
- Clippy is run on CI with `-- -D warnings` after resolving or explicitly allowing existing warnings to prevent regressions.
- Edition is explicitly set (`edition = "2021"` recommended).

2. IDE integration
- `rust-analyzer` extension is installed and active.
- Format-on-save is enabled.
- Clippy is used as the check command (not just `cargo check`).

3. Pre-commit hooks
- Use `pre-commit` or git hooks to run `cargo fmt --check` and `cargo clippy`.
- Prevents unformatted or lint-failing code from entering the repository.

4. Import organization
- On nightly rustfmt, `imports_granularity = "Crate"` groups imports by crate for readability.
- On nightly rustfmt, `group_imports = "StdExternalCrate"` separates std, external, and local imports; omit both keys on stable.

## Formatting Rules

- Indentation: 4 spaces (Rust standard).
- Line width: 100 characters (rustfmt default is 100).
- Trailing commas: Used in multi-line structures.
- Imports: Grouped by std, external crates, and local modules.

## Common Commands

- Format: `cargo fmt`.
- Check (no changes): `cargo fmt -- --check`.
- Lint: `cargo clippy`.
- Lint as errors: `cargo clippy -- -D warnings`.

## Output Requirements

When setting up or validating formatting, provide:
- Formatter versions and configuration.
- IDE integration status.
- Pre-commit hook setup summary.
- Any formatting conflicts or Clippy violations found.

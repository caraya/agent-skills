---
name: python-formatting
description: "Python formatting skill for Black, isort, and IDE configuration. Trigger phrases: format Python, Black config, code style, isort imports, linting, format on save, PEP 8."
---

# Python Formatting

## Use When

- Setting up or validating code formatting for Python projects.
- Configuring Black and isort for consistent style.
- Integrating formatting into IDE or pre-commit hooks.

## Standard Formatters

1. **Black** (recommended for Python)
- Opinionated, minimal configuration, fast.
- Enforces PEP 8 with specific style choices (88-char line width).
- Install: `pip install black`.

2. **isort** (import sorting)
- Organizes imports into sections (stdlib, third-party, local).
- Integrates with Black.
- Install: `pip install isort`.

3. **Ruff** (optional, fast linter and formatter)
- Modern, Rust-based; superset of some Black functionality.
- Can format and lint in one pass.
- Install: `pip install ruff`.
- If the project already uses Ruff or the user asks for a single-tool setup, use `ruff format` and `ruff check --select I` instead of Black/isort/flake8. Configure Ruff under `[tool.ruff]` with `line-length = 88`. Otherwise, default to Black + isort.

## Configuration

### `pyproject.toml` (Black and isort):
```toml
[tool.black]
line-length = 88
target-version = ['py39', 'py310', 'py311']

[tool.isort]
profile = "black"
line_length = 88
skip_glob = [".venv", "venv"]
```

### `.flake8` (linting):
```ini
[flake8]
max-line-length = 88
extend-ignore = E203,W503
exclude = .venv,venv,.git
```
flake8 does not read `pyproject.toml` unless the `Flake8-pyproject` plugin is installed.

### VS Code `.vscode/settings.json`:
```json
{
  "[python]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "ms-python.black-formatter",
    "editor.codeActionsOnSave": {
      "source.organizeImports": "explicit"
    }
  },
  "isort.args": ["--profile", "black"]
}
```

### `.pre-commit-config.yaml`:
```yaml
repos:
  - repo: https://github.com/psf/black
    rev: 24.4.2
    hooks:
      - id: black
  - repo: https://github.com/PyCQA/isort
    rev: 5.13.2
    hooks:
      - id: isort
```
Install with `pip install pre-commit && pre-commit install`.

## Checklist

1. Consistency
- Black is installed and configured via `pyproject.toml`.
- isort is configured with `profile = "black"` to avoid conflicts.
- Configuration is version-controlled and shared with team.

2. IDE integration
- Format-on-save is enabled in VS Code.
- Python extension is installed and active.
- Install the `ms-python.black-formatter`, `ms-python.isort`, and `ms-python.flake8` extensions.

3. Pre-commit hooks
- Use `pre-commit` framework with Black and isort hooks.
- Prevents unformatted code from entering the repository.

4. Import organization
- isort sorts imports into stdlib, third-party, local sections.
- Multi-line imports are handled consistently.

## Formatting Rules

- Line width: 88 characters (Black standard).
- Indentation: 4 spaces (PEP 8).
- String quotes: Double quotes (customizable, Black default).
- Trailing commas: Used for multi-line structures.
- Import order: Stdlib, third-party, local (isort).

## Common Commands

- Format: `black src/`.
- Sort imports: `isort src/`.
- Check: `black --check src/` or `isort --check src/`.
- Combined: `black src/ && isort src/`.

## Output Requirements

When setting up or validating formatting, provide:
- Formatter versions and configuration.
- IDE integration status.
- Pre-commit hook setup summary.
- Any conflicts or inconsistencies found.

If existing configuration conflicts with these defaults, do not overwrite it silently. List each conflict, state the recommended value, and ask the user to confirm before changing `pyproject.toml` or editor settings.

---
name: typescript-formatting
description: "TypeScript formatting skill for Prettier, ESLint, and IDE configuration. Trigger phrases: format TypeScript, Prettier config, code style, linting, format on save, ESLint rules."
---

# TypeScript Formatting

## Use When

- Setting up or validating code formatting for TypeScript projects.
- Configuring Prettier and ESLint for consistent style.
- Integrating formatting into the IDE or pre-commit hooks.

## Standard Formatters

1. **Prettier** (recommended for TypeScript)
- Opinionated, fast, minimal configuration.
- Handles TypeScript syntax including generics, union types, interfaces.
- Install: `npm install --save-dev prettier`.

2. **ESLint** (for linting and some auto-fixes)
- Use `eslint-config-prettier` to disable Prettier-conflicting rules.
- Run with `--fix` to auto-correct many issues.
- Install: `npm install --save-dev eslint eslint-config-prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin`.

## Configuration

### Prettier `.prettierrc` or `package.json`:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### ESLint configuration:

Check the installed ESLint version first with `npx eslint --version`. For ESLint 9+, use flat config; `.eslintrc.json` is not loaded by default. Install the flat-config dependencies: `npm install --save-dev @eslint/js typescript-eslint typescript`.

Use `eslint.config.mjs` (or `eslint.config.js` if the project uses `"type": "module"`):
```js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier
];
```

Use `.eslintrc.json` only for ESLint 8 or earlier:
```json
{
  "extends": ["eslint:recommended", "prettier"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": { "ecmaVersion": 2020, "sourceType": "module" },
  "rules": {}
}
```

### VS Code `.vscode/settings.json`:
```json
{
  "[typescript]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": { "source.fixAll.eslint": true }
  }
}
```

## Checklist

1. Consistency
- Prettier is installed and configured.
- ESLint rules do not conflict with Prettier (use `eslint-config-prettier`).
- All team members use the same Prettier and version-appropriate ESLint configuration.

2. IDE integration
- Format-on-save is enabled in `.vscode/settings.json`.
- ESLint extension is installed and active.

3. Pre-commit hooks
- Use `husky` or similar to run `prettier --write` and `eslint --fix` before commit.
- Install: `npm install --save-dev husky lint-staged`.

4. TypeScript-specific
- Type annotations are properly spaced (no extra spaces).
- Imports follow Prettier's default wrapping; do not enforce a one-per-line vs. grouped style unless the project explicitly configures a rule or plugin for that style.
- Generic types and function signatures are readable.

## Formatting Rules

- Line width: default 100 characters for new projects. If an existing Prettier configuration specifies a different `printWidth` or `tabWidth`, treat those values as the standard and do not flag them.
- Indentation: default 2 spaces for new projects; honor an existing Prettier configuration's `tabWidth` and `useTabs`.
- Semicolons: Use (default Prettier).
- Trailing commas: ES5 style where supported (for example, arrays and objects), excluding function parameters and arguments; those require `"trailingComma": "all"`.
- Quotes: Double quotes (Prettier default).

## Common Commands

- Format: `npx prettier --write "src/**/*.ts"`.
- Check: `npx prettier --check "src/**/*.ts"`.
- Lint and fix: `npx eslint --fix "src/**/*.ts"`.

## Output Requirements

When setting up or validating formatting, provide:
- Formatter versions and configuration.
- IDE setup summary.
- Pre-commit integration status.
- Any formatting conflicts or inconsistencies found.

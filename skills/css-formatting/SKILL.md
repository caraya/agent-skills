---
name: css-formatting
description: "Formatting and style guidance for CSS/stylesheet code: organization, naming, and linting."
---

# CSS Formatting

Purpose: standardize stylesheet formatting and lint rules so teams have consistent, machine-enforced style.

Recommended tools:
- Prettier (with a CSS/PostCSS plugin) for deterministic formatting.
- stylelint for lint rules, enforce property order, vendor-prefix policies, and allowed patterns.
- Editor integrations: format-on-save and shared editorconfig to reduce friction.

Opinionated rules (suggested):
- If the repository has an existing style guide or token system, align with it where possible.
- Use custom properties for tokens and keep tokens in a separate file.
- Prefer token names; avoid inline literal hex values in components.
- Use logical properties (margin-block, padding-inline, inset-inline) instead of physical ones unless the repository's browserslist targets browsers that lack support; if no browserslist is present, assume modern evergreen browsers and use logical properties.

Property ordering:
- Group by box model → positioning → typography → visual (color, background) → transforms/animation.

Color rules:
- Prefer semantic token usage: `var(--color-text)`
- For generated palettes, produce OKLCH values or tokenized variants; delegate complex color decisions to the `color-expert` skill. If the `color-expert` skill is not available, do not generate palette or contrast values yourself; ask the user to provide the final color values (or enable the `color-expert` skill) and continue with tokenized placeholders such as `var(--color-primary)` in the meantime.

CI integration:
- Add `stylelint` and `prettier --check` steps to CI to fail on style violations.

---
name: css-core
description: "Core CSS guidance for architecture, tokens, responsive patterns, and accessibility."
---

# CSS Core

Purpose: provide pragmatic, production-ready CSS guidance covering architecture, design tokens, responsive layout patterns, and accessibility-first color usage.

Color guidance:
- Default color space: OKLCH for perceptual uniformity when creating palettes, scales, and gradients. This default covers the choice of color space only, not palette design decisions.
- For any non-trivial color decisions (accessibility thresholds, palette harmonies, conversions where the target space is unspecified), use `color-expert` and don't make assumptions. Expressing colors in the OKLCH default is not such a decision.

Architecture:
- Prefer design tokens (CSS custom properties or JSON token files) for color, spacing, type, and radii.
- Use logical properties and container queries where appropriate; keep layout and visual tokens separate from components.
- Pattern examples: component-driven tokens → atomic components → composed pages. Prefer predictable specificity (avoid deep selector chains).

Best practices:
- Use semantic tokens (`--color-text`, `--bg-surface`, `--accent`) rather than raw hex in components.
- Prefer system fonts where performance matters; bundle web fonts asynchronously.
- Respect `prefers-reduced-motion` and `prefers-contrast`.

Accessibility:
- Design around contrast using APCA or WCAG as required by project policy. Automated accessibility checks (axe-core and Pa11y) are required: if the project already runs them in CI, keep them passing; if it has none, add them as part of the work and verify contrast manually in the interim. Automated checks are a floor, not a substitute for a full audit.
- If no project policy is specified, default to WCAG 2.2 AA (4.5:1 for body text, 3:1 for large text and UI components) and note that APCA is available on request. If the project uses APCA, which ties thresholds to font size and weight, follow the provided defaults for its conformance levels (Bronze, Silver, Gold).
- Do not rely on color alone to convey meaning; pair with icons, labels, or patterns.
- Accessibility validation results are required before CSS work is considered complete: on React projects, run `accessibility-core` plus `accessibility-react`; on all other projects, run `accessibility-core` (re-running it if it was already run earlier) and act on its findings.

When to call other skills:
- For color decisions that are non-trivial (accessibility thresholds, palette harmonies, conversions where the target space is unspecified): `color-expert`.
- For required accessibility validation: `accessibility-core`, plus `accessibility-react` on React projects.
- For accessibility audits: `ui-accessibility` skill.

This SKILL focuses on high-level decision-making rather than low-level syntax examples.

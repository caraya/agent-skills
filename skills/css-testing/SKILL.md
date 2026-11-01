---
name: css-testing
description: "Visual and automated testing strategies for CSS (visual regression, cross-browser, accessibility)."
---

# CSS Testing

Purpose: ensure CSS changes are safe, visually correct, and accessible across supported viewports and browsers.
Default matrix: 375px, 768px, 1280px widths; Chromium, Firefox, WebKit. Override with the project's browserslist/config if present.

Testing types:
- Unit/DOM assertions: use `@testing-library` + `jest-dom` for style assertions on computed values when deterministic.
- End-to-end (E2E): Playwright or Puppeteer for screenshot captures and interaction flows.
- Visual regression: Percy, Chromatic, Loki, or Playwright Snapshot tests to catch visual regressions. Detect configured tools by checking `package.json` dependencies and config files (`.percy.yml`, a `chromatic` script, `.loki/`, or Playwright `toHaveScreenshot` usage). If more than one is configured, use the one with existing test files or baselines; if tied, ask the user. If none is configured, default to Playwright Snapshot tests (no external service), unless Storybook is present, in which case use Chromatic.
- Accessibility: axe-core (automated) plus manual audit for keyboard + screen-reader flows.

Color & contrast checks:
- Use the `color-expert` skill (if available in the current session) to compute APCA/WCAG contrast thresholds; if it is not available, use the `apca-w3` or `wcag-contrast` npm packages directly to assert contrast in visual tests.
- When programmatically generating palettes for tests, use OKLCH unless `color-expert` suggests another space.

Best practices:
- Use token-driven tests — assert token values produce expected computed CSS rather than hard-coded colors.
- Keep visual baselines stable: lock fonts, viewport sizes, and emulate consistent device pixel ratio in CI.
- For flaky visual diffs, add heuristics: ignore anti-aliased text minor diffs, mask dynamic regions, and use thresholds.

CI recommendations:
- Run unit and accessibility checks on PRs; run visual regression nightly and on PRs that modify stylesheet files (`.css`, `.scss`, `.less`), design token files, component template/markup files, or font/image assets.

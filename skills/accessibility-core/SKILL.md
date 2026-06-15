---
name: accessibility-core
description: "Accessibility skill for WCAG 2.1 AA compliance, keyboard navigation, ARIA labels, focus management, meaningful empty and error states, responsive design, and loading transitions. Trigger phrases: accessibility, WCAG, ARIA, keyboard navigation, focus management, responsive design, loading states."
---

# Accessibility Core

The Accessibility Core skill provides essential features to ensure your application meets WCAG 2.2 AA compliance. It includes support for keyboard navigation, ARIA labels, focus management, meaningful empty and error states, responsive design, and loading transitions.

## Features

- **Keyboard Navigation**: Enables users to navigate through the application using keyboard shortcuts and tab navigation.
- **ARIA Labels**: Provides support for ARIA (Accessible Rich Internet Applications) labels to
- enhance screen reader compatibility and improve accessibility for users with disabilities.
- **Focus Management**: Ensures that focus is properly managed when navigating through the application,especially when modals, dialogs, or dynamic content are involved.
- **Meaningful Empty and Error States**: Displays informative messages and visuals when there are no results to show or when an error occurs, helping users understand the situation and how to proceed.
- **Responsive Design**: Adapts the layout and content to different screen sizes and orientations, ensuring a seamless experience across devices.
- **Loading Transitions**: Provides visual feedback during loading states, improving the user experience and reducing frustration.

## Description

This skill is designed to enhance the accessibility of your application by implementing best practices and guidelines for web accessibility. It ensures that users with disabilities can navigate and interact with your application effectively, while also improving the overall user experience for all users. By adhering to WCAG 2.2 AA standards, you can create an inclusive and accessible application.

## When To Use

- When developing a new application.
- When improving the accessibility of an existing application.
- When ensuring compliance with WCAG 2.2 AA standards.

## Shared Reference

When generating or scaffolding components, use `references/accessible-component-generation.md` as the source of truth for semantics, accessible names, keyboard behavior, focus handling, and non-happy-path states.

## Guidelines

### Keyboard Navigation
- [ ] All interactive elements focusable via Tab key
- [ ] Focus order follows visual/logical order
- [ ] Focus is visible (outline/ring on focused elements)
- [ ] Custom widgets have keyboard support (Enter to activate, Escape to close)
- [ ] No keyboard traps (user can always Tab away from a component)
- [ ] Skip-to-content link at top of page
- [ ] Modals trap focus while open, return focus on close

### Screen Readers
- [ ] All images have `alt` text (or `alt=""` for decorative images)
- [ ] All form inputs have associated labels (`<label>` or `aria-label`)
- [ ] Buttons and links have descriptive text (not "Click here")
- [ ] Icon-only buttons have `aria-label`
- [ ] Page has one `<h1>` and headings don't skip levels
- [ ] Dynamic content changes announced (`aria-live` regions)
- [ ] Tables have `<th>` headers with scope

### Visual
- [ ] Text contrast ≥ 4.5:1 (normal text) or ≥ 3:1 (large text, 18px+)
- [ ] UI components contrast ≥ 3:1 against background
- [ ] Color is not the only way to convey information
- [ ] Text resizable to 200% without breaking layout
- [ ] No content that flashes more than 3 times per second

### Forms
- [ ] Every input has a visible label
- [ ] Required fields indicated (not by color alone)
- [ ] Error messages specific and associated with the field
- [ ] Error state visible by more than color (icon, text, border)
- [ ] Form submission errors summarized and focusable

### Content
- [ ] Language declared (`<html lang="en">`)
- [ ] Page has a descriptive `<title>`
- [ ] Links distinguish from surrounding text (not by color alone)
- [ ] Touch targets ≥ 44x44px on mobile
- [ ] Meaningful empty states (not blank screens)

## Component Generation Guidance

For component scaffolding rules and anti-patterns, follow `references/accessible-component-generation.md`.

## Testing Tools

```bash
# Automated audit
npx axe-core          # Programmatic accessibility testing
npx pa11y             # CLI accessibility checker

# In browser
# Chrome DevTools → Lighthouse → Accessibility
# Chrome DevTools → Elements → Accessibility tree

# Screen reader testing
# macOS: VoiceOver (Cmd + F5)
# Windows: NVDA (free) or JAWS
# Linux: Orca
```

## Quick Reference: ARIA Live Regions

| Value | Behavior | Use For |
|-------|----------|---------|
| `aria-live="polite"` | Announced at next pause | Status updates, saved confirmations |
| `aria-live="assertive"` | Announced immediately | Errors, time-sensitive alerts |
| `role="status"` | Same as `polite` | Status messages |
| `role="alert"` | Same as `assertive` | Error messages |

## References
- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)
- [ARIA Authoring Practices Guide](https://www.w3.org/TR/wai-aria-practices/)
  - When using APG, use content from these areas:
    - "About This Interaction" sections
    - "Keyboard Interaction" sections
  - Do not use:
    - APG code examples
    - CodePen links (URLs starting with `https://codepen.io/`)
- [Here’s how to instruct a LLM to reference the ARIA Authoring Practices Guide](https://ericwbailey.website/published/heres-how-to-instruct-a-llm-to-reference-the-aria-authoring-practices-guide/). Supplemental guidance only; use it to inform how to consult APG. Treat WCAG and APG as the authoritative sources.
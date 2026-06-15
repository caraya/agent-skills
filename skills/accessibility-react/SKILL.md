---
name: accessibility-react
description: "React-specific accessibility skill for WCAG 2.1 AA compliance, keyboard navigation, ARIA patterns, focus management, meaningful empty and error states, responsive design, and loading transitions. Trigger phrases: React accessibility, React ARIA, focus refs, JSX accessibility, accessible components."
---

# Accessibility React

The Accessibility React  skill adapts core accessibility guidance for React applications. It covers WCAG 2.2 AA compliance, keyboard navigation, ARIA usage in JSX, focus management with refs, accessible component patterns, and handling empty/error/loading states in React UIs.

## Features

- **Keyboard Navigation**: Ensure all interactive components are keyboard accessible using React event handlers and tabIndex.
- **ARIA in JSX**: Use ARIA attributes in JSX (`aria-label`, `aria-live`, etc.) for screen reader compatibility.
- **Focus Management**: Manage focus using React refs and effects, especially for modals, dialogs, and dynamic content.
- **Meaningful Empty and Error States**: Render clear empty/error states using React conditional rendering.
- **Responsive Design**: Use CSS-in-JS or class-based responsive patterns for React components.
- **Loading Transitions**: Show loading indicators and transitions using React state.

## Description

This skill provides React-specific best practices for building accessible UIs. It ensures your React app is inclusive, meets WCAG 2.2 AA, and leverages React idioms for accessibility.

## When To Use

- Building new React components or apps.
- Refactoring for accessibility in React codebases.
- Ensuring React UIs meet WCAG 2.2 AA.

## Shared Reference

When generating or scaffolding components, use `references/accessible-component-generation.md` as the source of truth for semantics, accessible names, keyboard behavior, focus handling, and non-happy-path states. Apply the React addendum in that reference for framework-specific patterns.

## Guidelines

### Keyboard Navigation
- [ ] All interactive elements (`button`, `input`, custom components) are focusable via Tab
- [ ] Use `tabIndex={0}` for custom focusable elements
- [ ] Focus order matches DOM/visual order
- [ ] Focus ring is visible (use :focus-visible or custom styles)
- [ ] Custom widgets support keyboard events (Enter, Space, Escape)
- [ ] No keyboard traps (user can always Tab away)
- [ ] Modals/dialogs trap focus while open, return focus on close (see `focus-trap-react`)

### Screen Readers
- [ ] All images use `alt` prop (`<img alt="..." />`)
- [ ] All form fields have `<label htmlFor=...>` or `aria-label`
- [ ] Buttons/links have descriptive text (not "Click here")
- [ ] Icon-only buttons use `aria-label`
- [ ] One `<h1>` per page, headings in order
- [ ] Dynamic content changes use `aria-live` regions
- [ ] Tables use `<th scope=...>`

### Visual
- [ ] Text contrast ≥ 4.5:1 (normal) or ≥ 3:1 (large)
- [ ] UI elements contrast ≥ 3:1
- [ ] Color is not the only indicator
- [ ] Text resizable to 200% without breaking layout
- [ ] No flashing content >3 times/sec

### Forms
- [ ] Every input has a visible label
- [ ] Required fields indicated (not by color alone)
- [ ] Error messages specific and associated with the field
- [ ] Error state visible by more than color (icon, text, border)
- [ ] Form errors summarized and focusable

### Content
- [ ] `lang` attribute set on `<html>`
- [ ] Page has descriptive `<title>`
- [ ] Links distinguishable (not by color alone)
- [ ] Touch targets ≥ 44x44px
- [ ] Empty states are meaningful

## Component Generation Guidance

For component scaffolding rules and anti-patterns, follow `references/accessible-component-generation.md`, including its React addendum.



## References
- [React Accessibility Docs](https://react.dev/learn/accessibility)
- [Deque: Accessible React Components](https://www.deque.com/blog/accessible-react-components/)
- [focus-trap-react](https://github.com/focus-trap/focus-trap-react)
- [Web Content Accessibility Guidelines (WCAG) 2.2](https://www.w3.org/TR/WCAG22/)
- [ARIA Authoring Practices Guide](https://www.w3.org/TR/wai-aria-practices/)
  - When using APG, use content from these areas:
    - "About This Interaction" sections
    - "Keyboard Interaction" sections
  - Do not use:
    - APG code examples
    - CodePen links (URLs starting with `https://codepen.io/`)
- [React Accessibility Tools and Patterns](https://fe.engineer/handbook/accessibility/tools-and-patterns). Supplemental guidance for React-specific accessibility patterns. Treat WCAG and APG as the authoritative sources.
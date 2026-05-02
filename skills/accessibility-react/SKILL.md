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

## React Patterns & Examples

### Accessible Button
```jsx
<button onClick={handleDelete}>Delete Task</button>
```

### Accessible Link
```jsx
<a href="/tasks/123">View Task</a>
```

### Icon Button with ARIA
```jsx
<button aria-label="Close" onClick={onClose}>
  <CloseIcon />
</button>
```

### Focus Management with Ref
```jsx
import { useEffect, useRef } from "react";
function Modal({ open }) {
  const ref = useRef();
  useEffect(() => {
    if (open) ref.current?.focus();
  }, [open]);
  return (
    <div tabIndex={-1} ref={ref} role="dialog" aria-modal="true">
      Modal content
    </div>
  );
}
```

### Live Region for Updates
```jsx
<div aria-live="polite">{statusMessage}</div>
```

### Conditional Empty State
```jsx
{items.length === 0 ? <p>No results found.</p> : <ItemList items={items} />}
```

## Common Anti-Patterns (Avoid These)

### 1) Clickable `div` Instead of `button`
Do not use non-semantic elements for button behavior.

```jsx
// Don't
<div onClick={handleSave}>Save</div>

// Do
<button type="button" onClick={handleSave}>Save</button>
```

Why: `button` is keyboard-accessible by default and announces the correct role to assistive tech.

### 2) Fake Link with `onClick`
Do not create links with click handlers when navigation is the intent.

```jsx
// Don't
<span onClick={() => navigate("/settings")}>Settings</span>

// Do
<a href="/settings">Settings</a>
```

Why: Real links support expected keyboard and screen reader behaviors, including open-in-new-tab and link semantics.

### 3) Icon-Only Button Without Accessible Name
Do not rely on visual icons alone.

```jsx
// Don't
<button onClick={onClose}><CloseIcon /></button>

// Do
<button aria-label="Close dialog" onClick={onClose}><CloseIcon /></button>
```

Why: Screen readers need an accessible name to announce the button purpose.

### 4) Custom Interactive Element Without Keyboard Support
Do not attach only mouse handlers to custom elements.

```jsx
// Don't
<div onClick={toggleOpen}>Expand details</div>

// Better (if custom element is required)
<div
  role="button"
  tabIndex={0}
  onClick={toggleOpen}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") toggleOpen();
  }}
>
  Expand details
</div>

// Preferred
<button type="button" onClick={toggleOpen}>Expand details</button>
```

Why: Keyboard users must be able to discover, focus, and activate all interactive controls.



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
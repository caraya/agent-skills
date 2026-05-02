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

## Common HTML Patterns

### Buttons vs. Links

```html
<!-- Use <button> for actions -->
<button onClick={handleDelete}>Delete Task</button>

<!-- Use <a> for navigation -->
<a href="/tasks/123">View Task</a>

<!-- NEVER use div/span as buttons -->
<div onClick={handleDelete}>Delete</div>  <!-- BAD -->
```

### Form Labels

```html
<!-- Explicit label association -->
<label htmlFor="email">Email address</label>
<input id="email" type="email" required />

<!-- Implicit wrapping -->
<label>
  Email address
  <input type="email" required />
</label>

<!-- Hidden label (visible label preferred) -->
<input type="search" aria-label="Search tasks" />
```

### ARIA Roles

```html
<!-- Navigation -->
<nav aria-label="Main navigation">...</nav>
<nav aria-label="Footer links">...</nav>

<!-- Status messages -->
<div role="status" aria-live="polite">Task saved</div>

<!-- Alert messages -->
<div role="alert">Error: Title is required</div>

<!-- Modal dialogs -->
<dialog aria-modal="true" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Confirm Delete</h2>
  ...
</dialog>

<!-- Loading states -->
<div aria-busy="true" aria-label="Loading tasks">
  <Spinner />
</div>
```

### Accessible Lists

```html
<ul role="list" aria-label="Tasks">
  <li>
    <input type="checkbox" id="task-1" aria-label="Complete: Buy groceries" />
    <label htmlFor="task-1">Buy groceries</label>
  </li>
</ul>
```

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

## Common Anti-Patterns (Avoid These)

### 1) Clickable `div` Instead of `button`
Do not use non-semantic elements for button behavior.

```html
<!-- Don't -->
<div onclick="handleSave()">Save</div>

<!-- Do -->
<button type="button" onclick="handleSave()">Save</button>
```

Why: `button` is keyboard-accessible by default and announces the correct role to assistive tech.

### 2) Missing Alt Text on Images
Do not omit or use placeholder alt text.

```html
<!-- Don't -->
<img src="chart.png" />

<!-- Do -->
<img src="chart.png" alt="Monthly revenue trend: $15K to $22K" />

<!-- Decorative image -->
<img src="divider.png" alt="" aria-hidden="true" />
```

Why: Screen reader users cannot see images; alt text conveys essential content and context.

### 3) Color-Only State Indicators
Do not rely on color alone to communicate status.

```html
<!-- Don't -->
<div style="background: red">Error</div>

<!-- Do -->
<div style="background: #fee; border-left: 4px solid #c00;">
  <strong>Error:</strong> Email is required
</div>
```

Why: Color-blind users and those using black-and-white displays cannot distinguish meaning.

### 4) Icon-Only Buttons Without Labels
Do not rely on visual icons alone.

```html
<!-- Don't -->
<button><svg><!-- close icon --></svg></button>

<!-- Do -->
<button aria-label="Close dialog"><svg><!-- close icon --></svg></button>
```

Why: Screen readers need an accessible name to announce the button purpose.

### 5) Custom Interactive Element Without Keyboard Support
Do not attach only mouse handlers to custom elements.

```html
<!-- Don't -->
<div onclick="toggleOpen()">Expand details</div>

<!-- Do (if custom is required) -->
<div
  role="button"
  tabindex="0"
  onclick="toggleOpen()"
  onkeydown="if (event.key === 'Enter' || event.key === ' ') toggleOpen()"
>
  Expand details
</div>

<!-- Preferred -->
<button type="button" onclick="toggleOpen()">Expand details</button>
```

Why: Keyboard users must be able to discover, focus, and activate all interactive controls.

### 6) Using `tabindex > 0`
Do not manually override tab order.

```html
<!-- Don't -->
<button tabindex="5">Save</button>
<input tabindex="1" />
<a href="/" tabindex="10">Home</a>

<!-- Do -->
<input /> <!-- Natural tab order -->
<button>Save</button>
<a href="/">Home</a>

<!-- Use tabindex="0" or "-1" only -->
<div tabindex="0" role="button">Custom button</div>
```

Why: Manual tab ordering breaks for keyboard users and violates WCAG best practice.

### 7) Removing Focus Outlines
Do not hide focus indicators.

```css
/* Don't */
*:focus {
  outline: none;
}

/* Do */
*:focus-visible {
  outline: 2px solid #0066cc;
}
```

Why: Keyboard users rely on visible focus to navigate. If removed, the page becomes unusable.

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
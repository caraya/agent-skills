# Accessible Component Generation

Use this reference when generating or scaffolding new UI components that must be accessible by default. It complements the general audit guidance in `references/accessibility-checklist.md`.

## Goal

Generate components that start from semantic HTML, preserve keyboard and screen reader support, and ship with meaningful empty, error, and loading states.

## When To Use

- Creating a new reusable UI component
- Scaffolding a page-specific interactive component
- Replacing an inaccessible custom widget
- Reviewing generated UI code before accepting it

## Generation Rules

### 1. Start With The Correct Native Element

- Use `button` for actions, `a` for navigation, `input`/`select`/`textarea` for form controls, and `dialog` or an equivalent accessible dialog pattern for modals.
- Do not use `div` or `span` for interactive behavior unless no native element can express the interaction.
- If a custom interactive element is unavoidable, add the required role, keyboard behavior, focus handling, and accessible name.

### 2. Always Provide An Accessible Name

- Every interactive control must expose a clear accessible name through visible text, `label`, `aria-label`, or `aria-labelledby`.
- Icon-only controls must include an explicit accessible name.
- Link and button labels must describe the destination or action without relying on surrounding context.

### 3. Preserve Keyboard Access

- All interactive elements must be reachable with Tab in a logical order.
- Activation must work with the expected keyboard inputs for the pattern.
- Do not require pointer-only gestures for primary actions.
- Do not use `tabindex` values greater than `0`.

### 4. Manage Focus Intentionally

- If the component opens, closes, or reveals content, define where focus moves next.
- Dialogs and popovers that take focus must move focus inside on open and restore it on close.
- Validation summaries, inline errors, and other important state changes should be reachable without forcing users to hunt for them.

### 5. Expose State And Relationships

- Use native attributes first: `disabled`, `required`, `checked`, `selected`, `open`, and `aria-current` where appropriate.
- Use ARIA only to express information native HTML cannot.
- Connect helper text, errors, headings, and controlled regions with `aria-describedby`, `aria-labelledby`, and related attributes when needed.

### 6. Include Meaningful Non-Happy Paths

- Empty states must explain what happened and what the user can do next.
- Error states must identify the problem in text, not color alone.
- Loading states must announce progress when the content update matters to assistive technology users.
- Disabled or unavailable actions should remain understandable; avoid hiding essential context.

### 7. Keep Visual Accessibility In Scope

- Text and UI contrast must meet WCAG AA thresholds.
- Focus indicators must remain visible.
- Touch targets should be large enough for mobile use.
- Information must not depend only on color, motion, shape, or position.

## React Addendum

Use these patterns when the generated component is implemented in React.

- Use `useId()` to create stable IDs for input, hint, and error associations (`htmlFor`, `aria-describedby`, `aria-labelledby`).
- Forward refs for reusable controls so parent components can move focus intentionally after open, close, submit, and error events.
- Pass through native props and `aria-*` attributes rather than hiding them behind rigid abstractions.
- Keep semantic element choices in JSX (`button`, `a`, `input`) and avoid clickable `div` or `span` patterns.
- Keep live regions mounted when possible; update their text content rather than mounting and unmounting entire announcer nodes.

## Required Output For Generated Components

When generating a component, include:

- A short statement of the semantic pattern being used
- The accessible name source for each interactive control
- Keyboard interactions for any non-trivial widget
- Focus behavior for open, close, submit, and error flows when relevant
- Empty, loading, and error handling where the component can encounter those states

## Escalate Instead Of Guessing

Stop and ask for clarification if:

- The intended element semantics are ambiguous
- A custom composite widget is requested without a defined keyboard model
- The interaction copies a design that conflicts with native behavior
- The component appears to require an ARIA pattern with multiple valid implementations

## Verification Checklist

- [ ] Uses the correct native element where possible
- [ ] Every interactive control has an accessible name
- [ ] Keyboard-only users can reach and operate the component
- [ ] Focus order and focus return are defined where needed
- [ ] Errors, empty states, and loading states are understandable without color alone
- [ ] State, relationships, and status messages are exposed to assistive technology
- [ ] Visual contrast and target sizing meet baseline accessibility expectations

## See Also

- `references/accessibility-checklist.md`
- `skills/accessibility-core/SKILL.md`
- `skills/accessibility-react/SKILL.md`

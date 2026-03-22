# Agent Skills Repository

This repository contains custom agents and skills for AI coding assistants. The content is authored for VS Code Copilot but the domain knowledge inside each file is tool-agnostic and can be applied directly.

## Repository Structure

```
agents/     — Orchestration agents (high-level workflows)
skills/     — Domain-specific skill files (detailed technical guidance)
references/ — Reference documents (checklists, style guides, etc.)
```

## Agents

| File | Purpose |
|---|---|
| `agents/content-editor.md` | Senior editorial review of technical content before publication. Five-dimension review framework: correctness, architecture, readability, code examples, style. Asks for guidance when blocked. |
| `agents/content-ideation.md` | Generates first-draft Markdown from a text input or URL. Outputs frontmatter metadata. Does NOT auto-invoke content-editor — human reviews the draft manually. |
| `agents/polyglot-engineering.md` | Creator-first engineering agent for TypeScript, JavaScript, Python, Go, and Rust. Scaffolds projects when absent, implements features by default, formats code as the final step. |
| `agents/polyglot-performance.md` | Measures bottlenecks and recommends optimizations for TypeScript, JavaScript, Python, Go, and Rust. |
| `agents/content-summarizer.md` | Fetches a URL and returns variable-length summaries; asks for a preferred length if not provided; outputs a structured summary object plus a human-readable summary. |

## Skills

Each skill provides detailed checklists, patterns, and output requirements for a specific domain.

### Content (`skills/content/`)
- `style-lookup.md` — Style arbitration using Google developer docs style, Chicago fallback.
- `code-example-validation.md` — Quality gate for documentation code samples.

### Frontend (`skills/frontend/`)
- `ui-engineering.md` — Framework-agnostic UI engineering: accessibility (WCAG 2.1 AA), design system adherence, responsive design, avoiding the AI aesthetic.
- `react-ui.md` — React-specific: component architecture, hooks, state management patterns, optimistic updates.

### Language Skills

Each language has up to five skills: core, testing, debugging, formatting, and performance.

| Directory | Languages |
|---|---|
| `skills/typescript/` | core, testing, debugging, formatting, performance |
| `skills/javascript/` | core, testing, debugging, formatting, performance |
| `skills/python/` | core, testing, debugging, formatting, performance |
| `skills/go/` | core, testing, debugging, formatting, performance |
| `skills/rust/` | core, debugging, formatting, performance |

**Language-specific tool defaults:**
- TypeScript / JavaScript: Prettier, ESLint
- Python: Black, isort, pytest
- Go: gofmt, goimports, golangci-lint
- Rust: rustfmt, Clippy, criterion

### Shared (`skills/shared/`)
- `debugging-methodology.md` — Cross-language debugging workflow: reproduce → observe → hypothesize → isolate → fix.
- `polyglot-starter-index.md` — Overview of the creator-first polyglot setup and how to extend it.

## Key Conventions

- **Implement first.** `polyglot-engineering` defaults to writing code, not reviewing it. Switch to review mode only when explicitly requested.
- **Format last.** Every code change ends by invoking the appropriate language formatting skill.
- **Ask when blocked.** Agents do not autonomously guess or fill gaps — they surface ambiguity and ask for guidance.
- **No auto-chaining.** `content-ideation` and `content-editor` are independent pipeline stages. The human decides when to invoke each.
- **One agent, language skills.** Orchestration agents stay language-agnostic; language depth lives in skills.

## References

- `references/accessibility-checklist.md` — WCAG 2.1 AA checklist for frontend work.

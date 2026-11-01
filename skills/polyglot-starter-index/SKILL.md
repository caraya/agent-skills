---
name: polyglot-starter-index
description: Starter index for a creator-first polyglot setup with one general agent and language-specific skills. Use when bootstrapping or extending TypeScript, JavaScript, Python, and Go workflows with scaffold-if-missing and implement-first behavior.
---

# Polyglot Starter Index

## Recommended Structure

- agents/polyglot-engineering.md
- skills/typescript-core/SKILL.md
- skills/javascript-core/SKILL.md
- skills/python-core/SKILL.md
- skills/go-core/SKILL.md

## Operating Model

1. General agent defaults to implement-first behavior when users ask to build features.
2. If no project exists, the general agent scaffolds a minimal starter before feature implementation.
3. Language skills provide deep, language-specific implementation and validation guidance.
4. Shared cross-language skills can be added for concerns like security, docs, and performance.

## Creator-First Flow

1. Detect whether a project exists by checking for a language manifest (package.json, pyproject.toml, go.mod, or similar). If none is found, treat the project as missing.
2. Scaffold when missing. Use the language explicitly requested by the user. If none is specified, infer it from the request context; if still ambiguous, default to TypeScript and state the choice in the summary.
3. Implement requested functionality immediately.
4. Run available checks and iterate.
5. If the change is user-facing and `ui-accessibility` exists, invoke it as a final gate.
6. Summarize what was created, changed, and validated.

## How To Extend

1. Keep the general agent orchestration-focused and creator-first.
2. Add language skills for core language behavior.
3. Add framework skills only when framework APIs materially change best practices.
4. Keep language and framework descriptions specific with trigger phrases.
5. Keep each skill focused on one domain and one output contract.

## Suggested Next Skills

- react-ui
- vue-ui
- preact-ui
- sql-core
- devops-ci-core

## Frontend Skills (required when present)

- `skills/ui-engineering/SKILL.md` — Framework-agnostic UI engineering guidance (accessibility, design system, responsive).
- `skills/react-ui/SKILL.md` — React-specific UI patterns and invocation examples.
- `skills/preact-ui/SKILL.md` — Preact-specific UI patterns and invocation examples.
- `skills/vue-ui/SKILL.md` — Vue-specific UI patterns and invocation examples.
- `skills/ui-accessibility/SKILL.md` — Repository WCAG 2.1 AA enforcement skill; when present, invoke as final gating for any user-facing change.

Agent invocation (one-liner) for accessibility gating: invoke `ui-accessibility` attaching `axe-report.json`, `pa11y-report.html`, and `manual-checks.md` as artifacts. If any of these artifacts cannot be generated (for example, tooling is unavailable), invoke `ui-accessibility` with the artifacts that exist, note the missing ones explicitly, and flag the accessibility check as incomplete in the final summary.

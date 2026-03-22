# Agent Skills Repository — Quick Reference

This repo contains curated agents and domain-specific skills for AI-assisted development and content workflows.

## Agents

- `agents/content-editor.md` — Senior editorial review across five dimensions: correctness, architecture, readability, code examples, and style. Use before publication for thorough content QA.
- `agents/content-ideation.md` — Generates first-draft Markdown from text or a URL with YAML frontmatter; creator-first drafting for fast iteration.
- `agents/content-summarizer.md` — Fetches a URL, extracts the main article, and returns variable-length summaries (short/medium/long or custom word counts); returns metadata and key points.
- `agents/polyglot-engineering.md` — Creator-first engineering agent that scaffolds projects and implements features for TypeScript, JavaScript, Python, Go, and Rust. Enforces formatting and optional accessibility gating.
- `agents/polyglot-performance.md` — Profiling and performance recommendations across TypeScript, JavaScript, Python, Go, and Rust.

## Skills

Skills are organized under `skills/` by domain. Below is a concise listing with purpose notes.

### Content (`skills/content/`)
- `style-lookup.md` — Arbitration of editorial style decisions (Google developer docs first, Chicago fallback).
- `code-example-validation.md` — Validate documentation code examples for correctness, runnable completeness, and safety.

### Frontend (`skills/frontend/`)
- `ui-engineering.md` — Framework-agnostic UI engineering guidance: accessibility, responsive design, design-system adherence.
- `react-ui.md` — React-specific component architecture, state patterns, separation of concerns, and production-quality UI practices.
- `preact-ui.md` — Preact-focused UI patterns and ports of React guidance.
- `vue-ui.md` — Vue-specific UI patterns and component guidance.
- `ui-accessibility.md` — WCAG 2.1 AA enforcement, automated + manual testing guidance, and CI/devtool templates for accessibility checks.

### TypeScript (`skills/typescript/`)
- `typescript-core.md` — Type safety, tsconfig posture, and public API typing guidance.
- `typescript-debugging.md` — Sourcemap and runtime debugging for TypeScript.
- `typescript-formatting.md` — Prettier/ESLint configuration and formatting rules.
- `typescript-testing.md` — Type-aware testing strategies and framework recommendations.
- `typescript-performance.md` — Profiling, build/time, and bundle-size optimizations.

### JavaScript (`skills/javascript/`)
- `javascript-core.md` — Runtime correctness, async flow, and module compatibility.
- `javascript-debugging.md` — Node/browser runtime debugging patterns and tooling.
- `javascript-formatting.md` — Prettier/ESLint and formatting best practices.
- `javascript-testing.md` — Test infra and async/flaky test handling (Jest/Vitest guidance).
- `javascript-performance.md` — Event-loop and memory profiling, runtime optimizations.

### Python (`skills/python/`)
- `python-core.md` — Packaging hygiene, typing, and runtime correctness.
- `python-debugging.md` — pdb/debugpy, async debugging, and traceback analysis.
- `python-formatting.md` — Black/isort and formatting integration.
- `python-testing.md` — pytest best practices and test structure.
- `python-performance.md` — GIL analysis, profiling, and optimization strategies.

### Go (`skills/go/`)
- `go-core.md` — API design, concurrency safety, and idiomatic error handling.
- `go-debugging.md` — Delve, race detection, and goroutine analysis.
- `go-formatting.md` — gofmt/goimports and linting configuration.
- `go-testing.md` — Table-driven tests, mocking, and goroutine-leak checks.
- `go-performance.md` — Benchmarking and pprof-based performance tuning.

### Rust (`skills/rust/`)
- `rust-core.md` — Ownership, borrowing, lifetimes, and idiomatic safety patterns.
- `rust-debugging.md` — Compiler diagnostics, LLDB/GDB use, and unsafe code investigation.
- `rust-formatting.md` — rustfmt and Clippy guidance.
- `rust-performance.md` — Benchmarking, allocation analysis, and profiling.

### Shared (`skills/shared/`)
- `debugging-methodology.md` — Cross-language debugging workflow: reproduce → observe → hypothesize → isolate → fix.
- `polyglot-starter-index.md` — Overview and starter notes for the creator-first polyglot setup.

## References

- Accessibility checklist: `references/accessibility-checklist.md`

## How to use this repo

- Browse `agents/` for orchestration agents you can run or adapt.
- Open `skills/` to find the domain-specific guidance an agent will invoke.
- Use `templates/` (when present) to scaffold projects with recommended devDependencies and CI snippets (e.g., accessibility templates for frontend).

## Claude plugin

- Manifest: the plugin manifest lives at [/.claude-plugin/plugin.json](.claude-plugin/plugin.json#L1). It declares plugin `commands` for SKILLs and agent orchestrators.
- What it does: each `command` maps a stable name to an `input_schema`/`response_schema` and a `handler` HTTP endpoint (e.g. `/api/commands/...` or `/api/agents/...`). A runtime server should implement those endpoints to execute the associated skill or agent orchestration.
- Agents as orchestrators: several `agents/*.md` files (for example [agents/instructional-designer.md](agents/instructional-designer.md#L1)) were added as orchestrator commands in the manifest so the plugin can trigger multi-skill workflows.
- Quick checks:

```bash
# validate JSON syntax
node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json','utf8')) && console.log('OK')"

# pretty-print (optional)
python3 -m json.tool .claude-plugin/plugin.json | less -SR
```

- How to wire up: run a small HTTP server that implements the declared `handler.endpoint` routes. Each route should accept the command `input_schema` JSON, call the appropriate SKILL/agent logic (loading `skills/*/SKILL.md` as needed), and return JSON matching `response_schema`.
- Example call (after running your handler server locally on port 3000):

```bash
curl -s -X POST http://localhost:3000/api/commands/instructional_designer/orchestrate \
	-H 'Content-Type: application/json' \
	-d '{"projectName":"Demo","audience":"Engineers","durationWeeks":2}'
```

---
Generated by the repository maintenance assistant.

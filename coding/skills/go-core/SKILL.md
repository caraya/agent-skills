---
name: go-core
description: "Go skill for API design, interface boundaries, concurrency safety, and idiomatic error handling. Trigger phrases: Go, goroutine, channel, context, interface, error wrapping, go test, race condition."
---

# Go Core Skill

## Use When

- Reviewing or writing Go code.
- Validating concurrency, context usage, and interface design.
- Checking for idiomatic and safe error handling.

## Checklist

Use this checklist for a separate review pass only when the user explicitly requests a review. Do not automatically review newly written code.

1. API and package design
- Keep interfaces minimal and behavior-focused.
- Ensure package boundaries are cohesive.

2. Error handling
- Return wrapped errors with useful context.
- Never swallow errors; every error must be returned, logged with context, or explicitly documented as intentionally ignored.
- Do not panic in library (non-main) code; reserve panics for truly unrecoverable programmer errors in main or init.

3. Concurrency and context
- Check goroutine lifecycle and cancellation flow.
- Validate channel ownership and close patterns.
- Ensure context is propagated for request-scoped work.

4. Quality and maintainability
- Keep functions small and dependency injection explicit.
- Verify zero-value behavior is safe and documented.

## Output Requirements

When writing new code, produce the requested Go implementation without a checklist report or review findings. Leave the checklist review for a separate, explicitly requested pass.

When reviewing, if no issues are found for a checklist category, state "No issues found" for that category rather than inventing findings.

For each review finding provide:
- Location
- Checklist category (API and package design, error handling, concurrency and context, or quality and maintainability) and risk
- Operational impact
- Minimal fix

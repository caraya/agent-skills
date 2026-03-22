---
name: javascript-testing
description: JavaScript testing skill for test infrastructure, async test patterns, and runtime reliability using Jest, Vitest, or Mocha. Trigger phrases: JavaScript tests, Jest setup, async tests, test timeouts, flaky tests, test fixtures, mock functions.
---

# JavaScript Testing

## Use When

- Setting up or validating test infrastructure for JavaScript projects.
- Writing tests that cover async, event-driven, or concurrent behavior.
- Debugging flaky or timeout issues in tests.

## Testing Infrastructure

Recommend:
- **Jest** for most projects (built-in async support, snapshot testing, module mocking).
- **Vitest** for Vite-based projects (faster, ESM-native).
- **Mocha + Chai + Sinon** for explicit control and custom setup.

## Checklist

1. Test structure
- Tests clearly arrange setup, execute behavior, and assert outcomes (AAA pattern).
- Before/After hooks are used sparingly and only for expensive setup (databases, servers).
- Test names describe expected behavior, not implementation details.

2. Async patterns
- Promises are properly handled: return promises, use await, or handle errors.
- Timeouts are set appropriately for slow operations (not instant, not infinite).
- Concurrent tests do not share global state or modify shared fixtures.

3. Mocking and isolation
- External dependencies (APIs, databases, file system) are mocked.
- Mocks are reset or cleared between tests to prevent test pollution.
- Mock implementations match the real API contract.

4. Runtime reliability
- Tests pass consistently in CI and locally (no race conditions or timing bugs).
- Error messages are helpful when assertions fail.
- Cleanup code runs reliably even when tests fail.

## Output Requirements

For each finding provide:
- Location (test file and line)
- Runtime or reliability risk
- Why it matters
- Minimal fix with code example

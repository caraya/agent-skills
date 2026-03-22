---
name: go-testing
description: Go testing skill for test structure, table-driven tests, and concurrency validation using Go's testing package and testify. Trigger phrases: Go tests, testing package, table-driven tests, mock interfaces, test coverage, go test, concurrent tests, goroutine leaks.
---

# Go Testing

## Use When

- Setting up or validating test infrastructure for Go projects.
- Writing tests using table-driven patterns and interface mocking.
- Checking for goroutine leaks and concurrency safety in tests.

## Testing Infrastructure

Recommend:
- **Go testing package** (stdlib) for core tests.
- **testify/assert** and **testify/require** for clearer assertions.
- **testify/mock** or interface-based mocking for dependencies.
- **go-leak** or **goleak** for detecting goroutine leaks in tests.

## Checklist

1. Test structure
- Tests follow the naming convention: `Test<FunctionName>`.
- Subtests are used with `t.Run()` to organize related test cases.
- Each test is independent and does not rely on external state or execution order.

2. Table-driven tests
- Complex test cases use table-driven patterns to avoid code duplication.
- Each table entry has a descriptive name for clarity in failures.
- Setup and teardown per row is avoided; use subtests with separate hooks if needed.

3. Interface mocking and dependency injection
- Dependencies are injected as interfaces, not concrete types.
- Mock implementations satisfy the interface contracts.
- Mock calls are verified (call count, arguments) when behavior is important.

4. Concurrency and resource safety
- Tests verify goroutine cleanup: no leaks from background goroutines.
- Channels are closed properly to signal shutdown.
- Context cancellation is tested and propagates correctly.
- No race conditions detected when running with `-race` flag.

5. Error handling
- Error cases are tested explicitly, not assumed.
- Error messages are checked when relevant.
- Panics are caught and handled where appropriate with `t.Recover()`.

## Output Requirements

For each finding provide:
- Location (test file and line)
- Concurrency or safety risk
- Why it matters
- Minimal fix with code example

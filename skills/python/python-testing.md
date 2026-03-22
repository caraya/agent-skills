---
name: python-testing
description: Python testing skill for test structure, pytest best practices, and coverage validation. Trigger phrases: Python tests, pytest, unittest, test fixtures, test parameterization, coverage, mock objects, test discovery.
---

# Python Testing

## Use When

- Setting up or validating test infrastructure for Python projects.
- Writing tests using pytest fixtures, parameterization, or mocking.
- Checking test coverage and test isolation.

## Testing Infrastructure

Recommend:
- **pytest** for most projects (fixtures, plugins, simple syntax, rich output).
- **unittest** for projects requiring stdlib only.
- **coverage.py** or **pytest-cov** for coverage tracking.

## Checklist

1. Test structure
- Tests use descriptive names: `test_<function>_<condition>_<expected_outcome>`.
- Each test is independent and can run in any order.
- Fixtures are used for setup, not module-level setup functions.

2. pytest patterns
- Fixtures use appropriate scope (`function`, `module`, `session`) to avoid pollution.
- Parameterization is used for testing multiple inputs without duplication.
- Conftest.py provides shared fixtures without cluttering test files.

3. Mocking and isolation
- External dependencies (APIs, databases, file system) are mocked using `unittest.mock` or `pytest-mock`.
- Mock return values match the real API contract.
- Assertions on mock calls are specific: check call count, arguments, not just that it was called.

4. Coverage and quality
- Critical paths and error conditions have coverage.
- Edge cases (None, empty collections, exceptions) are tested.
- Assertions fail with helpful messages (use custom assertions or pytest markers).

## Output Requirements

For each finding provide:
- Location (test file and line)
- Coverage or isolation risk
- Why it matters
- Minimal fix with code example

---
name: typescript-testing
description: "TypeScript testing skill for test infrastructure, type-safe test design, and coverage validation using Jest, Vitest, or Mocha. Trigger phrases: TypeScript tests, Jest setup, type-safe mocks, test coverage, testing framework, test types, assertion errors."
---

# TypeScript Testing

## Use When

- Setting up or validating test infrastructure for TypeScript projects.
- Writing type-safe tests that leverage TypeScript's type system.
- Checking test coverage and assertion quality.

## Testing Infrastructure

Recommend:
- **Vitest** for Vite-based projects (fast, modern ESM support).
- **Jest** for most Node and frontend projects (batteries-included, type support via ts-jest).
- **Mocha + Chai** for minimal, explicit setups.

## Checklist

1. Test structure
- Tests are organized by feature or module, not just by type (unit/integration).
- Test names clearly describe the behavior being tested, not just the function name.
- Arrange-Act-Assert (AAA) pattern is consistent throughout.

2. Type safety
- Mocks and stubs are typed consistently with the code under test.
- Generic type parameters are preserved in mock signatures.
- Test utilities and helpers export proper types.

3. Coverage and quality
- Critical paths and error conditions have test coverage.
- Edge cases (null, undefined, empty arrays) are tested.
- Assertions are specific: use `toBe` for primitives and reference identity, `toEqual`/`toStrictEqual` for structural comparison of objects and arrays, and avoid weak assertions such as `toBeTruthy`, `toBeDefined`, or `expect.anything()` where an exact value can be asserted.

4. Infrastructure
- Test runner is configured for the project's module format (ESM, CommonJS).
- Type checking is enabled during test runs (e.g. ts-jest `diagnostics: true` rather than `isolatedModules`/babel-only transforms, Vitest `typecheck.enabled`, or a `tsc --noEmit` step that includes test files in the CI test script).
- Test files are excluded from production builds via tsconfig.

## Output Requirements

Group findings under Critical, High, Medium, and Low, in that order. Use these levels:
- **Critical**: Test infrastructure or type-checking is fundamentally ineffective, leaving severe regressions undetected.
- **High**: Important gaps in type safety or coverage affect core or high-risk behavior.
- **Medium**: A meaningful but localized test quality, coverage, or configuration issue.
- **Low**: A minor improvement with limited impact on confidence or maintainability.

For each finding provide:
- Location (file path and line; for configuration issues cite the config file and key)
- Type safety or coverage risk
- Why it matters
- Minimal fix with code example
- When setting up new infrastructure rather than reviewing existing tests, output a recommended framework with justification, the required dependencies, and complete config file contents instead of per-finding entries.

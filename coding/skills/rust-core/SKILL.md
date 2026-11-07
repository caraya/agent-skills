---
name: rust-core
description: "Rust skill for ownership, borrowing, lifetimes, trait design, and idiomatic safe code. Trigger phrases: Rust, borrow checker, ownership, lifetime, trait, unsafe, cargo, crate, enum, pattern matching."
---

# Rust Core Skill

## Use When

- Writing or reviewing Rust code.
- Resolving borrow checker, lifetime, or ownership errors.
- Designing traits, enums, and public APIs.
- Checking idiomatic patterns and safety boundaries.

## Checklist

1. Ownership and borrowing
- Is ownership transferred only when necessary? Prefer references.
- Are borrows as short-lived as possible to avoid lifetime conflicts?
- Is `clone()` used only where necessary, not as a borrow checker escape hatch?

2. Lifetimes
- Are explicit lifetime annotations required, or can they be elided?
- Are struct lifetimes the minimum needed to satisfy the borrow checker?
- Are lifetime errors caused by a structural design issue rather than annotation?

3. Trait design
- Are traits focused on behavior, not data?
- Are `Display`, `Debug`, `From`, `Into`, `Default`, and `Error` implemented where appropriate?
- Are trait bounds on functions limited to the capabilities actually needed, with flexible inputs where appropriate (e.g. accept `impl AsRef<str>` instead of `String`, or `impl Iterator<Item = T>` instead of `Vec<T>`)?
- Is static dispatch (`impl Trait`/generics) preferred unless heterogeneous collections or runtime polymorphism call for dynamic dispatch through a dyn-compatible trait?

4. Error handling
- Use `Result<T, E>` for recoverable errors; `panic!` only for unrecoverable states.
- Use the `?` operator for ergonomic propagation.
- Define domain-specific error types that implement `std::error::Error`.

5. Safety and unsafe
- Is `unsafe` justified and documented with a safety comment?
- Is the unsafe block as small as possible?
- Are invariants upheld across the unsafe boundary?

6. Idiomatic patterns
- Use iterators and combinators over manual loops where clarity allows.
- Use `match` exhaustively; avoid `_ =>` catch-all arms when matching on a closed, locally-defined enum. Catch-all arms are acceptable for `#[non_exhaustive]` enums, integers, strings, or other open-ended types.
- Prefer `Option`/`Result` over sentinel values or panics.

## Output Requirements

When writing new code or designing an API, output the code first, followed by a short list of the checklist items that influenced the design. Use the per-finding format only when reviewing existing code.

For each review finding provide:
- Location
- Ownership, safety, or API risk
- Why it matters
- Minimal fix with code example

## Scope

Consolidated guidance should live in `rust-core`, `rust-debugging`, `rust-formatting`, and `rust-performance`.

Use this `rust-core` SKILL as the authoritative source for core Rust guidance; the `rust` placeholder has been removed.

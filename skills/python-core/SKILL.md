---
name: python-core
description: "Python skill for correctness, packaging hygiene, typing clarity, and reliable runtime behavior. Trigger phrases: Python, pip, venv, typing, dataclass, async Python, pytest, import errors."
---

# Python Core Skill

## Use When

- Reviewing or writing Python code.
- Checking import health, typing, and packaging assumptions.
- Validating error handling and testability.

## Checklist

1. Correctness and readability
- Favor explicit behavior over implicit magic.
- Check mutable default argument hazards.
- Validate exception handling scope and specificity.

2. Typing and interfaces
- Use type hints where they improve clarity.
- Ensure public functions have stable contracts.

3. Packaging and imports
- Validate import paths and package layout assumptions.
- Confirm dependency expectations are explicit.

4. Runtime reliability
- Check resource handling with context managers.
- Validate async usage and blocking boundaries.

## Output Requirements

Group findings under severity headings in this order: **Critical**, **High**, **Medium**, and **Low**. If there are no findings for a particular severity, use none rather than omit the heading.

Each finding should include:

- Location
- Defect or risk
- Why it matters
- Minimal fix

If no defects or risks are found, state explicitly that the code passed the checklist and list which checklist areas were verified.

Use these severity definitions consistently:

- **Critical** — Causes crashes, data loss, or incorrect results in normal execution (e.g., mutable default mutated across calls, unawaited coroutine, import that fails at runtime).
- **High** — Likely to cause incorrect behavior or failures under common conditions, or hides errors (e.g., bare except swallowing exceptions, resource leak on error path).
- **Medium** — Fragile or misleading code that works today but will break under plausible changes (e.g., implicit dependency, unstable public signature).
- **Low** — Readability, typing clarity, or maintainability improvements with no behavioral impact.

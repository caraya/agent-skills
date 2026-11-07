---
name: python-testing
description: "Python testing skill for test structure, pytest best practices, and coverage validation. Trigger phrases: Python tests, pytest, unittest, test fixtures, test parameterization, coverage, mock objects, test discovery."
---

# Python Testing

Use this SKILL for pytest/unittest setup, fixture design, parameterization, and diagnosing test isolation or coverage issues.

Recommended tools:
- pytest (fixtures, plugins, simple syntax)
- unittest (stdlib-only projects)
- coverage.py / pytest-cov for coverage

Checklist
- Descriptive test names and independent tests
- Appropriate fixture scopes to avoid pollution
- Parameterize repetitive checks
- Mock external dependencies and assert calls precisely

Templates & Examples

Example pytest test:

```py
def test_add():
    assert add(1, 2) == 3
```

Conftest snippet (fixture):

```py
import sqlite3
import pytest

@pytest.fixture
def db(tmp_path):
    conn = sqlite3.connect(tmp_path / "test.db")
    yield conn
    conn.close()
```

Example finding (under **Medium**):

- File and line: `app/auth.py:42`
- Risk type: Coverage
- Why it matters: Invalid tokens and expired sessions are not covered.
- Minimal fix:
  ```py
  def test_invalid_token():
      ...
  ```

Output requirements
- When reviewing existing tests for coverage or isolation problems, assign each finding a severity based on the impact a defect could have if it escaped the tests:
  - **Critical**: A gap could let a defect cause catastrophic impact, such as widespread data loss, a major security failure, or a prolonged outage.
  - **High**: A gap could let a defect break a critical user flow or cause substantial service disruption, with no reliable safeguard.
  - **Medium**: A gap could let a defect cause meaningful but bounded user or operational impact, or affect an important edge case.
  - **Low**: A gap is unlikely to cause more than minor, localized impact, such as a non-critical edge case or limited test-isolation concern.
- Group findings under severity headings in Critical, High, Medium, Low order. Include each finding's file and line, risk type (coverage or isolation), why it matters, and a minimal fix with a code example. For empty groups, write "None."
- For setup, fixture design, or parameterization requests, respond with a short explanation followed by a complete, runnable code example; the finding format does not apply.

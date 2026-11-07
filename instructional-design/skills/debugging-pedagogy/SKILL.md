---
name: debugging-pedagogy
description: "Use when designing or assessing software-debugging instruction: five-stage framework, hypothesis testing, program tracing, debugger tools, error-message interpretation, and common error patterns. Not for troubleshooting live incidents."
---

# Debugging Pedagogy

Scope: Use this skill to design and assess debugging instruction, not to troubleshoot live incidents.

When assessing existing instruction, map its activities to the five stages, check each Validation item, and report findings in two tables: (1) Stage coverage with columns Stage, Present?, Gap, Suggested change; (2) Validation checklist with columns Validation item, Met?, Evidence, Suggested change.

When designing new instruction, output in this order: (1) target defects and prerequisites, (2) a Procedure-step plan mapped to the five stages, (3) the debugging lab CSV rows — one row per target defect identified in step (1), using the header TaskID,Description,SeedBug,ScaffoldSteps, (4) the rubric table, (5) a Validation checklist confirming each item is met.

When revising existing instruction, first produce the assessment tables, then output the design sections only for stages or Validation items marked as gaps. For conceptual questions about the framework, answer directly without the tables. If the request mixes modes, complete the assessment first, then the design.

If you need to diagnose a live issue, use methodology: `skills/debugging-methodology/SKILL.md`.

Core model (five stages): Test/Evaluate → Identify Bug → Represent Program → Locate Bug → Correct Bug.

Following Klahr and Carver's framework, model each stage explicitly:

| Stage | Learner action |
|-------|----------------|
| Test/Evaluate | Reproduce behavior and compare actual with expected output |
| Identify Bug | Explain the discrepancy and determine whether it indicates a defect |
| Represent Program | Build a mental model of intended behavior and relevant state |
| Locate Bug | Narrow the cause using hypotheses, tracing, and observations |
| Correct Bug | Make a focused change and check for regressions |

The stages can repeat as new evidence changes the learner's understanding.

Procedure:
1. Identify target defects, prerequisite concepts, and required tool skills.
2. Prepare reproducible faulty programs, expected behavior, and validated fixes.
3. Model investigation with a think-aloud and guided practice.
4. Fade hints for independent diagnosis in a new example.
5. Debrief evidence, unsuccessful hypotheses, and transfer to future problems.

Instructional elements:
- Teach systematic hypothesis testing and experiment design.
- Practice with error-pattern recognition and debugger tool fluency.
- Include rubrics for debugging tasks using the template criteria: Bug Identification, Hypothesis Testing, Fix Quality.
- Teach print/log inspection, breakpoints, stepping, and error-message interpretation explicitly.
- Use verbalization or rubber-duck explanations; for every verbal task, also provide an equivalent written-reflection option so learners who cannot or prefer not to speak can complete it.
- Ask for a hypothesis and predicted observation before changing code.
- Supply layered hints before showing a solution; avoid unsupported trial and error.
- Assess reasoning as well as correction; score speed only if explicitly required.

Classroom exercises:
- Faulty-code labs with stepwise scaffolding and error logs.
- Pair-debugging rotations with reflection prompts.

## Templates

Debugging task rubric (Markdown table):

| Criterion | 3 — Exemplary | 2 — Competent | 1 — Developing | 0 — Missing |
|---|---:|---:|---:|---:|
| Bug Identification | Accurately identifies root cause | Locates likely area | Partial identification | No clear identification |
| Hypothesis Testing | Systematic, documented tests | Tests used but limited | Ad-hoc testing | No tests performed |
| Fix Quality | Robust, regression-free | Fixes bug, minor issues | Fix incomplete | No fix |

Typical debugging lab CSV header:
TaskID,Description,SeedBug,ScaffoldSteps
DBG-01,Fix failing auth flow,Missing header,Run tests;Inspect logs;Add assertion

Validation:
- Defects are reproducible and acceptance criteria are clear.
- Hints support reasoning without immediately revealing the fix.
- Independent practice tests transfer beyond the worked example.
- Tools and response formats are accessible to the target learners.

## Output constraints

- Do not include quantitative claims about learning improvement unless the user supplies a source; otherwise state effects qualitatively and note that the claim is unverified.

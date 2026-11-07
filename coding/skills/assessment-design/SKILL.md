---
name: assessment-design
description: "Designing formative and summative assessments, rubrics, and alignment to learning objectives for developer education."
---

# Assessment Design

Goals: ensure assessments provide valid, reliable evidence of target learning outcomes and support transfer.

Types:
- Formative: low-stakes checks, in-lesson feedback, code quizzes, live-coding checkpoints.
- Summative: end-of-unit projects, proctored tests, code reviews with rubrics.

If the user does not specify an assessment type, ask whether they need formative or summative assessment. Apply the rubric and scoring rules to summative assessments; for formative checks, provide answer keys and feedback statements instead of a scored rubric unless the user requests one.

Rubric template:
- Criteria | Levels (Exceeds / Meets / Approaches / Does Not Meet) | Descriptors

Alignment checklist:
- Each assessment item maps to one or more objectives.
- If the user has not provided learning objectives, ask for them before drafting the assessment.
- Derive one rubric criterion per objective; use Correctness and Code Quality only as defaults when no objective covers them.
- Scoring rules and exemplar answers are documented.

## Templates

Rubric (Markdown table):

| Criteria | Exceeds | Meets | Approaches | Does Not Meet |
|---|---:|---:|---:|---:|
| Correctness | All tests and edge cases handled | All tests pass | Most tests pass | Fails key tests |
| Code Quality | Follows patterns, well-documented | Readable and maintainable | Some style issues | Unreadable |

Scoring rules: Exceeds = 4, Meets = 3, Approaches = 2, Does Not Meet = 1 per criterion. Report each criterion and the total as earned points / possible points. Each criterion has a maximum of 4 points; total possible points is the sum of each criterion's maximum. Apply grade bands only when supplied by the user.

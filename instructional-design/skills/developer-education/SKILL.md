---
name: developer-education
description: "Use when designing programming courses, developer training, code-comprehension activities, live coding, coding assessments, interactive notebooks, or transfer between languages and frameworks. Adds software-specific pedagogy to general instructional design; does not assume DevRel or platform-adoption goals."
---

# Developer Education

Apply programming-specific methods only when learners need to read, write, review, or reason about software. Combine with the applicable general delivery, analysis, objectives, and assessment skills.

## Procedure

1. Establish programming experience, language and framework familiarity, tool proficiency, and target tasks.
2. Check setup requirements, permissions, versions, prerequisite concepts, and access needs. Separate environment friction from conceptual difficulty.
3. Define observable code-reading, implementation, review, and troubleshooting outcomes as relevant.
4. Select comprehension strategies, examples, scaffolding, and practice for the delivery mode.
5. Design authentic assessment, feedback, and transfer tasks.
6. Pilot from a clean environment with representative learners; log missing steps and misconceptions.

## Code Comprehension and Cognitive Load

Following the programming cognition perspective in Felienne Hermans' *The Programmer's Brain* (2021):

- Use meaningful names and visible structure to support chunking.
- Build a repertoire of programming plans: common code patterns and the problems they solve.
- Teach beacons: recognizable features that suggest a structure or purpose.
- Limit unfamiliar syntax, tools, and concepts introduced together.
- Use tracing, prediction, explanation, and modification before asking for independent implementation.

Explicitly teach and compare these strategies:

| Strategy | Learner action | Useful context |
|----------|----------------|----------------|
| Top-down | Hypothesize program purpose, then verify against code | Familiar domain or recognizable patterns |
| Bottom-up | Trace statements and combine observations | Unfamiliar code or local investigation |
| Opportunistic | Switch strategies as evidence develops | Realistic maintenance and problem-solving |

## Expert Blind Spots and Transfer

- Ask experts to verbalize hidden decisions, tool operations, and assumed prerequisites.
- Include recent learners in reviews and friction-log every setup and practice step.
- Distinguish true carryover, false carryover, and abstract principles expressed through different syntax.
- Use compare-and-contrast activities across languages or frameworks.
- Call out similar-looking constructs with different behavior.
- Assess transfer in a new codebase or context, not only reproduction of a tutorial.

For explicit defect diagnosis and correction, use [Debugging Pedagogy](../debugging-pedagogy/SKILL.md).

## Delivery-Specific Adaptations

### Classroom: Live Coding

- Prepare a tested example, checkpoints, and a recovery path.
- Build or modify code in meaningful increments and narrate decisions; do not just reveal the finished solution.
- Model error interpretation and recovery intentionally.
- Make code readable at presentation distance and describe relevant changes aloud.
- Separate observation from follow-along coding when doing both would overload learners.
- Pause for predictions, tracing, and questions.
- Supply checkpoint files or version-control states, runnable examples, captions, and a transcript.

Think-aloud prompts:
- "What input and output do we expect?"
- "Which edge cases should we consider?"
- "What evidence would confirm this hypothesis?"
- "Which abstraction does this example illustrate?"

### Workshop: Pair Programming and Labs

- Provide starter code, validated setup instructions, acceptance tests, and optional extensions.
- Define driver (implements) and navigator (reviews, anticipates, questions) roles.
- Rotate roles every 10-15 minutes as a starting point, adjusting for the task and access needs.
- Ask both partners to explain decisions; interrupt domination or passive observation.
- Use shared editors where appropriate, such as VS Code Live Share or Replit, with accessible alternatives.
- Coach through questions before providing snippets; explain any code supplied.
- Debrief with working, incomplete, and alternative solutions; connect findings to professional practice.

### Self-Paced: Executable Practice

- Use runnable examples, embedded editors, or notebooks when they reduce setup barriers.
- Couple narrative, code, and expected output without hiding prerequisites.
- For Jupyter, Pluto, or Observable notebooks, provide a known execution order and recovery instructions.
- Offer guided modifications, independent challenges, hints, and solutions revealed on request.
- Use tests and explanatory feedback, not only pass/fail indicators.
- Provide downloadable materials, supported environment details, and troubleshooting resources.

## Code Assessment and Portfolios

- Use realistic tasks and tools; include architecture or multi-file organization only when aligned to objectives.
- Include code comprehension, implementation, debugging, or design critique as required by the objectives.
- Pair an initial submission with revision when feedback and maintenance practices are part of the goal.
- Teach peer code review using explicit criteria, constructive-feedback training, templates, and reflection.
- Evaluate correctness, reasoning, maintainability, and collaboration only where each is an intended outcome.
- Use portfolios to show growth, decisions, collaboration, and revision history, not just finished products.
- GitHub repositories, pull requests, and issues may supply evidence; offer alternatives if public participation or platform use is not required.

## Access, Confidence, and Support

- Make code navigable as text; do not rely on screenshots, visual layout, or syntax highlighting alone.
- Test editors, notebooks, code samples, and assessment interfaces with relevant assistive technologies.
- Provide explicit error-message vocabulary and distinguish everyday from programming-specific meanings.
- Do not conflate programming competence with mathematics unless the task genuinely requires it.
- Use non-mathematical examples when mathematics is incidental.
- Normalize struggle, show incremental progress, and provide context-restoration aids after interruptions.
- Offer predictable instructions, processing time, and participation options without inferring needs from diagnoses.

## Outputs and Validation

Add to the general design plan only as applicable:
- Technical prerequisite and setup checklist.
- Code-comprehension strategy and programming-pattern map.
- Debugging activities and error-recovery support.
- Language/framework transfer contrasts.
- Coding assessment criteria and environment validation plan.

Check that examples run in the stated environment, expected outputs are correct, prerequisite assumptions are explicit, and learner review is completed or planned. Verify research statistics before citing them rather than treating context-specific results as universal.

Use [DevRel Integration](../devrel-integration/SKILL.md) separately when adoption, advocacy, or community contribution is an explicit goal.

## References

- Hermans, F. (2021). *The Programmer's Brain*.
- Williams, L., & Kessler, R. (2001). "Investigating the Feasibility of Pair Programming in Industry."

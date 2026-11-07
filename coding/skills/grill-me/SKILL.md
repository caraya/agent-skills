---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
license: MIT
---

If no plan or design has been shared yet, first ask me to describe the plan before beginning the interview. Interview me relentlessly about every aspect of this plan. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer. Stop the interview when either (a) I say "done", or (b) you have no remaining unresolved questions. If I say "done" while decisions are still open, adopt your recommended answer for each remaining decision, mark them as assumptions, and proceed to the summary. Then output a consolidated summary listing each decision, the chosen answer, and its rationale.

Ask the questions one at a time.

If I cannot answer a question or decline to decide, tentatively adopt your recommended answer, mark it as an assumption, and continue; list all assumptions in the final summary.

If a question can be answered by exploring the codebase, explore the codebase first. If the codebase conclusively answers the question, briefly state what you found and the conclusion you drew, then move to the next question. If the codebase does not conclusively answer the question, state what you found, then ask me the question directly with your recommended answer. If no codebase is available, ask me directly.

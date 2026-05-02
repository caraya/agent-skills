---
name: delivery-workshop
description: "Instructional design patterns for hands-on developer workshops: intensive practice, collaborative problem-solving, peer learning, facilitated labs, and coaching. Trigger phrases: workshop, hands-on, lab, practice-driven, collaborative learning, coached practice, small groups."
---

# Delivery — Workshop

This skill adapts instructional design principles for intensive, hands-on developer workshops. It covers facilitated lab environments, peer learning dynamics, coaching strategies, collaborative problem-solving, and creating productive constraints that drive learning through doing.

## Features

- **Scaffolded Practice**: Guided labs progressing from worked examples to independent challenges
- **Collaborative Problem-Solving**: Pair and group work with intentional peer roles
- **Coaching & Circulation**: Facilitator moves through room, asks questions, unblocks without solving
- **Real-Time Feedback**: Immediate debugging support, code review on-the-fly
- **Lab Stations or Breakout Teams**: Differentiated difficulty or specialization
- **Reflection & Debrief**: Group processing after practice, surfacing learning

## When To Use

- Designing 2-4 hour intensive practice sessions
- Building peer programming or pairing-based learning
- Creating capstone projects with facilitation
- Designing hackathons, code retreats, or sprint-style learning
- Facilitating open lab hours with coaching

## Guidelines

### Lab Design

- [ ] **Clear problem statement**: Learners understand what they're trying to achieve
- [ ] **Starter template or skeleton code**: Reduces setup friction, focuses on core learning
- [ ] **Graduated complexity**: Easy win (20-30%), medium challenge (40-60%), extension (80%+)
- [ ] **Acceptance criteria**: "You've succeeded when..."
- [ ] **Hints available, not solutions**: Hint cards, scaffolded docs, not full code
- [ ] **Estimated time**: "This section should take ~20 min" (learners self-pace within bounds)
- [ ] **Checkpoints**: "Stop here; we'll debrief together" at natural breaks
- [ ] **Success is visible**: Running tests, working feature, or artifact to demo

### Pair Programming Structure

**Optimal pairing**:
- Mix skill levels intentionally (novice + intermediate > homogeneous)
- Define roles: **driver** (types) and **navigator** (directs, reviews)
- Rotate every 10-15 minutes (timer helps)
- Both roles critical to learning

**Role clarity**:
- **Driver**: Writes code, asks for direction, types suggestions from navigator
- **Navigator**: Reads code, spots issues, looks ahead, asks clarifying questions
- Avoid: Driver ignoring navigator; navigator dictating verbatim

**Facilitation**:
- [ ] Introduce roles; explain why pairing accelerates learning
- [ ] Watch for dominance: "Navigator, what should happen next?"
- [ ] Support quieter partners: "Driver, can you explain your approach to your navigator?"
- [ ] Normalize struggle: "Disagreement is good—it surfaces assumptions"
- [ ] Debrief: "What did you learn from your partner's approach?"

### Coaching & Circulation

**Ask, don't tell**:
- ❌ "You need to add a null check here"
- ✅ "What could go wrong if the input is null?"

**Diagnostic questions**:
- "What's the error message telling you?"
- "What did you expect to happen? What happened instead?"
- "Walk me through your approach step by step"
- "What have you tried so far?"
- "Is there a simpler test case you could try first?"

**Unblocking strategies** (in order):
1. Clarifying question (helps them find the path)
2. Hint: "Have you considered...?" or "What if you tried...?"
3. Pointed resource: "Check the section on X in the docs"
4. Demonstration (show the concept, not the full solution)
5. Code snippet + explanation (last resort; ensure they understand before moving on)

**Circulation pattern**:
- [ ] Systematically visit every pair/group
- [ ] Start with pairs showing visible struggle
- [ ] Check in with confident pairs to prevent complacency
- [ ] Notice and interrupt unproductive patterns early (thrashing, passivity)
- [ ] Spend 2-5 min per pair, then move on

### Peer Learning Dynamics

**Structured peer feedback** (after practice):
- [ ] Pair review: "Compare your solutions; what's different?"
- [ ] Rotation review: Solution posted; others annotate with feedback sticky notes
- [ ] Fishbowl: One pair codes while others watch, then discuss approach

**Psychological safety in peer work**:
- [ ] Normalize mistakes: "Great—you found a common edge case"
- [ ] Celebrate different approaches: "You both solved it; show both methods"
- [ ] Frame feedback as curious: "I'd expect this to fail; did it?"
- [ ] Facilitator models: "Here's code I wrote; it has a bug—can you spot it?"

**Preventing dominance**:
- [ ] Enforce driver/navigator role rotation (timer)
- [ ] Interrupt code hogging: "Navigator, take the driver role"
- [ ] Group size: pairs are ideal; groups of 3+ require active facilitation
- [ ] Assign roles explicitly: "A is driver; B is navigator; you'll swap at X"

### Lab Checkpoints & Debrief

**Checkpoint design**:
- After ~15-20 min of independent work, pause for group debrief
- Show 2-3 representative solutions (working, partially working, alternative approach)
- Discuss tradeoffs, common errors, and "why this matters"
- Reset: "Clear this and try the next section"

**Debrief structure** (5-10 min):
1. **Show & Tell** (2-3 min): One or two pairs demo their solution
2. **Compare** (2-3 min): "How is your approach different? Both valid?"
3. **Reflect** (2-3 min): "What was hard? What surprised you?"
4. **Connect** (1-2 min): "How does this relate to production code you'll write?"

**Group problem-solving debrief**:
- Start with a failing test or bug introduced by the facilitator
- Pairs/groups debug collaboratively; share findings
- Reveal the solution incrementally (not all at once)

### Lab Environment Setup

**Physical workshops**:
- [ ] Large monitors or projectors so all can see code
- [ ] Enough desk space for pairs to sit comfortably side-by-side
- [ ] Power outlets and reliable WiFi
- [ ] Facilitator can circulate (not blocked by furniture)

**Virtual workshops** (Zoom/Teams):
- [ ] Breakout rooms for pairs
- [ ] Shared code editor (VS Code Live Share, Google Docs, Replit, etc.)
- [ ] Screen sharing enabled (both can see and share)
- [ ] Video on for accountability and connection
- [ ] Hand-raise or emoji reactions for "I need help"
- [ ] Facilitator pops into breakout rooms on rotation

### Difficulty Stratification

**Optional**: Offer 2-3 lab tracks based on skill:

| Track | Learner Profile | Lab Focus | Scaffolding |
|-------|---|---|---|
| **Foundations** | New to topic | Core concepts, simple problems | Heavy scaffolding, step-by-step |
| **Intermediate** | Some experience | Realistic problems, design decisions | Moderate scaffolding, open-ended |
| **Advanced** | Experienced | Optimization, edge cases, architecture | Minimal scaffolding, challenge extension |

- Make track selection low-pressure: "Pick where you're most comfortable; you can switch"
- Share solutions from all tracks at debrief (cross-learning)

## Lesson Structure

### Gagné's Nine Events — Workshop Application

In a workshop, events 1-5 are compressed into the opening; events 6-7 dominate the lab time; events 8-9 happen during debrief. Some events are offloaded to artifacts (starter code, hint cards) rather than instructor speech.

| Event | Workshop Implementation |
|---|---|
| **1. Gain attention** | Open with a broken or incomplete system learners will fix; make the problem visible immediately |
| **2. Inform learner of objectives** | Acceptance criteria on the lab brief serve as objectives: "You've succeeded when all tests pass" |
| **3. Stimulate recall of prior knowledge** | 5-min warm-up question or a quick look at related code learners have already written |
| **4. Present content** | Short, focused demo (10-15 min max) before releasing learners to the lab; just enough to unblock |
| **5. Provide learning guidance** | Hint cards at 3 levels; scaffolded starter code; coaching questions during circulation — not answers |
| **6. Elicit performance** | The lab itself; learners produce a working artifact with clear success criteria |
| **7. Provide feedback** | Coaching during circulation; whole-group debrief highlights common patterns and clever solutions |
| **8. Assess performance** | Checkpoint demo: pairs show their running solution; structured peer review using rubric |
| **9. Enhance retention & transfer** | Debrief question: "What would you change if the input was X?" or "Where does this pattern appear in your own codebase?" |

### Design Patterns

**Worked Example → Guided Practice → Independent Practice**
- Starter code is the "worked example skeleton" — structure is given, logic is missing
- Guided stage: first task is small and focused; acceptance criteria are concrete
- Independent stage: extension challenges with no scaffolding; no time pressure

**Faded Scaffolding via Hint Cards**
- Hint level 1: reframe the question ("What should happen if input is null?")
- Hint level 2: point to a relevant concept or doc section
- Hint level 3: show the pattern but not the exact solution
- Facilitator never jumps straight to level 3; always probe with questions first

**Chunking per Lab**
- Each lab task addresses one concept; bundle tasks into a sequence rather than one large blob
- State the concept explicitly in the task header: "Task 2 — Error handling"
- Time-box tasks: "This should take ~20 min; extension is optional"

### Activity Checklist (per workshop lab)

- [ ] Problem statement is concrete and motivating
- [ ] Starter code eliminates setup friction and focuses on the core concept
- [ ] Acceptance criteria defined: "You're done when..."
- [ ] Hint cards or scaffolded docs available (3 levels)
- [ ] Pairs defined with intentional skill mixing
- [ ] Extension task available for early finishers
- [ ] Checkpoint debrief scheduled at natural break
- [ ] Transfer prompt in closing debrief

## Workshop Template: 3-Hour Hands-On Lab

**0-10 min**: Intro & Setup
- Objectives and success criteria
- Demonstrate the problem or show a working solution
- Pair learners intentionally (mix skill levels)
- Ensure everyone can run starter code

**10-35 min**: Guided Lab 1 (Easy)
- Facilitator walks through first example with narration
- Learners code along, with facilitator support
- Checkpoint: Show solution; discuss approach (5 min)

**35-50 min**: Pair Lab 2 (Medium)
- Pairs code independently; facilitator circulates
- Hints available; limited direct help
- Checkpoint: Compare solutions (5 min)

**50-60 min**: Break

**60-100 min**: Pair Lab 3 (Harder)
- Minimal scaffolding; pairs solve open-ended problem
- Facilitator coaches via questioning
- Checkpoint: Debrief; show multiple solutions (10 min)

**100-120 min**: Challenge & Reflection
- Optional extension: optimize, add feature, or edge case handling
- Reflection: "What did you learn? What was hard?"
- Feedback round: "How was the pacing? What would help you practice more?"

**120-180 min**: Open Lab (Optional)
- Learners continue at own pace
- Facilitator available for 1:1 coaching
- Social time, peer help
- Optional: lightning talks from advanced participants

## Feedback & Assessment in Workshops

**Immediate feedback** (during circulation):
- Point out working code: "Notice how you handled that edge case—good thinking"
- Flag issues: "This might fail when X; trace through it"
- Celebrate effort: "You've been debugging for 10 min; that's exactly the right approach"

**Peer feedback protocol**:
- 1-on-1 after pairing: "What did you learn from your partner?"
- Feedback pairs (separate from coding pairs): structured review of artifact

**Self-assessment checkpoints**:
- Rubric or checklist: "Rate your solution: [ ] Works, [ ] Efficient, [ ] Readable"
- Reflection prompt: "What would you improve if you had more time?"

## Common Workshop Pitfalls

| Pitfall | Impact | Mitigation |
|---------|--------|-----------|
| Too much lecturing, not enough practice | Low retention, passive engagement | Limit demo to 5-10 min; practice should be 70%+ |
| Pairs unable to get unblocked; frustration spirals | Some give up; others waste time | Facilitator circulates relentlessly; time-box debugging |
| Lab too easy or too hard for group mix | Slow learners rush/copy; fast learners bored | Offer difficulty tiers; facilitate switches mid-lab |
| No debrief; learners leave without reflection | Lessons not consolidated; transfer weak | Schedule checkpoint debriefs; never skip them |
| Dominance by confident pairs | Quieter learners sit passively | Enforce role rotation; ask quiet partner directly |
| Vague problem statement | Learners unclear on goal; waste time | Show working example; state success criteria clearly |
| No starter code; setup takes 30 min | Time lost; frustration before learning starts | Provide skeleton; version control; easy local setup |
| Facilitator stuck with one pair | Others stall or go off-track | Set time limits; offer hints; escalate to group debrief |

## References

- Pair Programming Research: Williams & Kessler (2001), "Investigating the Feasibility of Pair Programming in Industry"
- Coaching: Gallwey, W. T. (1974). *The Inner Game of Tennis* (foundational coaching model)
- Collaborative Learning: Johnson, D. W., & Johnson, R. T. (2009). *Energizing Learning*
- Peer Teaching: Mazur, E. (1997). *Peer Instruction* (techniques for peer-driven learning)

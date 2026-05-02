---
name: delivery-classroom
description: "Instructional design patterns for synchronous classroom delivery of developer education: lecture + live coding, pacing, group dynamics, real-time feedback, and engagement strategies. Trigger phrases: classroom, lecture, live coding, synchronous, real-time interaction, in-person training, workshop leader."
---

# Delivery — Classroom

This skill adapts instructional design principles for synchronous, instructor-led classroom delivery of developer education. It covers live coding demonstrations, managing group dynamics, real-time pacing, immediate feedback loops, and engagement in shared learning spaces (physical or virtual).

## Features

- **Live Coding Demonstrations**: Structured instructor walkthroughs that show thinking, not just finished code
- **Real-Time Pacing**: Matching pace to group comprehension, reading the room, adjusting on the fly
- **Immediate Feedback**: Live Q&A, quick checks, pair feedback, and correction in the moment
- **Group Dynamics**: Managing participation equity, preventing dominance, building psychological safety
- **Engagement Strategies**: Polling, think-pair-share, live participation, discussion facilitation
- **Structured Breaks**: Strategic pauses protecting attention and enabling cognitive consolidation

## When To Use

- Designing instructor-led training, bootcamps, or courses
- Planning live coding sessions or technical workshops
- Preparing synchronous online classes (Zoom, Teams, etc.)
- Designing for in-person conference talks or training

## Guidelines

### Session Structure (General)
- [ ] Clear learning objectives stated at the start
- [ ] 15-20 min max for any single segment before interaction/break
- [ ] Mix of instructor input, guided practice, independent work
- [ ] Closing recap with next steps and resources
- [ ] Time explicitly reserved for Q&A

### Live Coding Demonstrations
- [ ] Code typed live, not pasted (shows real-time thinking)
- [ ] Mistakes introduced and debugged on the fly (models error recovery)
- [ ] Narrate the "why" behind each step (think-aloud protocol)
- [ ] Use version control or clear state transitions so learners can follow
- [ ] Avoid scripts—allow for improvisation and tangential questions
- [ ] Project code on large screen with high contrast, large font (minimum 16-18pt)
- [ ] Pause frequently for questions; silence is OK
- [ ] Record sessions so learners can replay at their pace

### Real-Time Pacing

**Signs you're going too fast**:
- Confused faces, lack of note-taking, few questions
- Learners asking "wait, what was that?"
- Multiple hands raised with similar clarification questions

**Signs you're going too slow**:
- Fidgeting, side conversations, checking phones
- Early finishers waiting passively
- Questions veering off-topic (sign of attention drift)

**Pacing strategies**:
- Poll the room: "How many followed that? Show with fingers 1-5."
- Graduated complexity: easy example → slightly harder → challenging extension
- Offer parallel tracks mentally: "If you're comfortable, try X; otherwise stick with Y"
- Build in 5-minute buffer before hard deadline for recap/catch-up

### Immediate Feedback Loops

- [ ] Frequent quick checks: polls, thumbs up/down, raised hands
- [ ] Normalize mistakes: "Let me break this on purpose to show the error"
- [ ] Pair-and-share model: "Turn to your neighbor and explain what just happened"
- [ ] Open Q&A with no penalty: "Any question? It probably helps 3 others"
- [ ] Live chat moderation (for virtual): monitor for confusion, answer publicly
- [ ] Post-activity: "What was confusing? Raise your hand or chat"

### Group Dynamics & Inclusion

**Preventing dominance**:
- [ ] Intentional hand-raising process: wait, give thinkers time, go to non-dominant hands first
- [ ] Structured turn-taking: "We'll hear from 3 people, then move on"
- [ ] Breakout rooms: pair or small-group discussion before whole-group sharing
- [ ] Think-pair-share: solo reflection → pair discussion → share (avoids cold-calling)
- [ ] Written responses: poll or chat allows introverts to participate without verbal pressure

**Building psychological safety**:
- [ ] Model mistakes early: "I usually forget the import statement too"
- [ ] Normalize struggle: "This is legitimately hard; confusion is the learning"
- [ ] Use "we" language: "We're learning this together"
- [ ] Respond to wrong answers constructively: "Good thinking; here's where it diverges"
- [ ] No ridicule or rushed corrections; frame errors as valuable insights

**Accessibility & Neurodiversity**:
- [ ] Captions/transcripts available (especially for neurodivergent learners processing audio)
- [ ] Visual + auditory: slides, code, whiteboarding, not audio-only
- [ ] Advance warning of cold-calling or surprise activities (ADHD, autism)
- [ ] Option to engage via chat/written response (not just verbal)
- [ ] Quiet breaks: "Mute video, grab water, no pressure to engage for 5 min"
- [ ] Recording available so learners can process asynchronously

### Engagement Strategies

**Think-Pair-Share Protocol**:
1. **Think** (2 min): Individual reflection or problem-solving
2. **Pair** (3-4 min): Discuss with neighbor or breakout partner
3. **Share** (5 min): Volunteers report back to whole group
- Dramatically increases participation vs. cold-calling

**Live Polling**:
- Multiple-choice question displayed; learners vote via hand, chat, or tool
- Show results, discuss the misconceptions revealed
- Use to diagnose where the group is struggling
- "Most said B—let's trace why that's incorrect"

**Pair Programming in Real-Time** (for coding workshops):
- Screen share: one codes, other navigates (provides direction, spots bugs)
- Swap every 5-10 minutes
- Instructor circulates, asks questions, unblocks pairs
- Reduces performance anxiety; distributed expertise

**Whiteboarding & Sketching**:
- Visual representation of abstract concepts (especially for kinesthetic learners)
- Problem-solving before code: flowchart, pseudocode, data structure sketch
- Reduce cognitive load by externalizing thinking

### Breaks & Consolidation

- [ ] 10-minute break every 50-60 minutes (not just at meals)
- [ ] 5-minute micro-breaks every 15-20 minutes (shift position, look away)
- [ ] Strategic pause: 2-minute silence after difficult content for processing
- [ ] Recap every 20-30 min: "Here's what we just covered..."
- [ ] Spaced summary: beginning of session covers yesterday's key points
- [ ] Parking lot: "Great question—let's write that down and circle back"

## Lesson Structure

### Gagné's Nine Events — Classroom Application

All nine events are instructor-controlled and happen in real time. Sequence them within the session arc.

| Event | Classroom Implementation |
|---|---|
| **1. Gain attention** | Hook: surprising bug, live failure, provocative question, or demo that breaks expectations |
| **2. Inform learner of objectives** | State them verbally + show on slide: "By the end of this, you'll be able to..." |
| **3. Stimulate recall of prior knowledge** | Quick show-of-hands, poll, or 1-min pair discussion: "What do you already know about X?" |
| **4. Present content** | Live coding + think-aloud narration; limit to one concept per 15-20 min segment |
| **5. Provide learning guidance** | Worked example with visible reasoning; narrate decisions, not just keystrokes |
| **6. Elicit performance** | Structured practice exercise with clear acceptance criteria; learners code while you circulate |
| **7. Provide feedback** | Live corrections, whole-group debrief of common errors; celebrate clever approaches |
| **8. Assess performance** | Quick check: poll, thumbs-up, or cold-call a pair to explain their solution |
| **9. Enhance retention & transfer** | Closing prompt: "Where else would you apply this?" + recap of key mental model |

### Design Patterns

**Worked Example → Guided Practice → Independent Practice**
- Instructor codes live with think-aloud (worked example)
- Learners follow along or fill in gaps in starter code (guided)
- Learners solve a related but distinct problem independently (independent)
- Timebox each phase explicitly; announce transitions

**Faded Scaffolding**
- Attempt 1: Instructor demonstrates fully; learners observe and annotate
- Attempt 2: Instructor codes skeleton; learners complete the body together
- Attempt 3: Learners code solo; instructor circulates and asks questions only

**Chunking per Segment**
- Max 2-3 new concepts per 20-minute segment
- Separate syntax learning from concept learning where possible
- Name each chunk explicitly so learners can anchor recall

### Activity Checklist (per classroom session)

- [ ] Learning objective stated and visible at the start
- [ ] Prior knowledge activated (poll, warm-up, or discussion)
- [ ] Worked example with think-aloud narration
- [ ] Learner practice with clear acceptance criteria
- [ ] Feedback loop after practice (whole-group debrief or pair share)
- [ ] Closing transfer prompt or reflection question
- [ ] Recap of key mental model at session end

## Session Template: 90-Minute Live Coding Workshop

**0-5 min**: Intro
- Welcome, housekeeping, objectives, what success looks like

**5-10 min**: Warm-up (relate to prior knowledge)
- Think-pair-share: "When have you encountered this problem before?"
- Poll: "How many have used [related tool]?"

**10-40 min**: Live demo 1 + practice
- Instructor live-codes (10 min, narrating thinking)
- Learners try it together (guided, with instructor support) (10 min)
- Quick poll or pair-check (2 min)
- Debrief: address errors, celebrate wins (2 min)

**40-50 min**: Break

**50-80 min**: Live demo 2 + practice
- Instructor live-codes more complex scenario (10 min)
- Learners practice independently; instructor circulates (15 min)
- Pair share: "Compare your approach with a neighbor" (5 min)
- Common issues addressed (5 min)

**80-90 min**: Wrap-up
- Recap key points (3 min)
- Q&A + parking lot review (4 min)
- Next steps, resources, where to practice (2 min)
- Exit ticket: anonymous feedback or reflection (1 min)

## Recording & Asynchronous Access

**If recording**:
- [ ] Edited, not raw (remove dead time, include captions)
- [ ] Chapters/timestamps marking key segments
- [ ] Show code at full resolution with captions overlaid
- [ ] Transcript + searchable notes
- [ ] Linked to asynchronous follow-up activities (not just passive video)

**Hybrid approach**:
- Live session focused on interaction, Q&A, relationship-building
- Recording available for those who miss or need replay
- Asynchronous pre-work or post-work activities (self-paced practice)

## Facilitator Skills

### Think-Aloud Protocol
When live coding, narrate your mental process:
- "I'm asking: what's the input here?"
- "I'm worried about edge cases—let me add a guard clause"
- "That's not working; let me add a print to see the state"
- "This is a good place to loop back to the abstraction"

### Reading the Room
- **Body language**: Furrowed brows, fidgeting, note-taking patterns indicate comprehension
- **Question cadence**: Drop in questions = confusion; spike = engagement moment
- **Silence patterns**: Thoughtful silence is good; awkward silence = lost
- **Breakout room debrief**: "What was hard? What did you figure out?"

### Redirecting Off-Topic Questions
- "Great question—it's related but beyond today's scope. Let's park that [writes it down]"
- "Can we take that discussion offline so we stay on track?"
- "That's a common edge case; we'll address it after the next demo"

## Common Pitfalls

| Pitfall | Impact | Mitigation |
|---------|--------|-----------|
| Pasting code instead of typing | Learners miss the thinking process | Commit to live coding; type slowly, narrate |
| No breaks or only end-of-day | Attention & retention collapse | Micro-breaks every 15-20 min |
| Dominance by few vocal learners | Quiet learners disengage | Structured turn-taking, think-pair-share, chat option |
| Keeping perfect pace | Some learners lost, others bored | Embrace flexibility; read the room, adjust |
| Recording without transcripts | Inaccessible to deaf/HoH learners | Provide captions and transcript |
| Spending 30 min on one problem | Momentum lost, others frustrated | Set time limits; "Let's move on; I'll help you after" |
| Assuming prior knowledge | Jargon unexplained, new learners confused | Explicitly surface assumptions; ask clarifying questions |
| All instruction, no collaboration | Passive, low engagement | Mix 1:1 or pair interaction throughout |

## References

- Bonwell, C. C., & Eison, J. A. (1991). "Active Learning: Creating Excitement in the Classroom"
- Knowles, M. S. (1984). *Andragogy in Action* (adult learning principles for classroom design)
- McKeachie, W. J., & Svinicki, M. (2014). *Teaching Tips* (practical classroom facilitation)
- Hermans, F. (2021). *The Programmer's Brain* (cognitive load in live coding)

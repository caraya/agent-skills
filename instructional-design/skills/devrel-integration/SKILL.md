---
name: devrel-integration
description: "Use when integrating education with developer relations, developer advocacy, platform adoption, developer journey mapping, B2D strategy, developer segmentation, DDMU roles, or open-source contributor onboarding and community learning pathways."
---

# DevRel Integration

Add DevRel goals to an instructional-design plan only when adoption, advocacy, or community participation is part of the brief. Programming instruction alone does not require this skill.

## Procedure

1. Confirm learner needs, platform/community context, and intended learning and program outcomes.
2. Segment audiences by experience, technical context, decision role, organization, and contribution intent.
3. Map educational assets to journey stages and identify missing transitions.
4. Design community touchpoints and contributor pathways appropriate to each segment.
5. Friction-log the complete experience as a target developer, including discovery, setup, practice, and next steps.
6. Define separate learning, adoption, and community measures. Pilot and revise without treating activity metrics as proof of learning.

## Developer Journey

Use Lewko and Parton's developer journey as a planning lens:

| Stage | Developer activity | Educational response |
|-------|--------------------|----------------------|
| Discover | Become aware of a technology | Inspiration, credible examples, what is possible |
| Evaluate | Assess fit for a need | Comparisons, realistic capabilities, limitations |
| Learn | Acquire necessary skills | Instruction, guided practice, feedback |
| Build | Create with the technology | Authentic projects, references, troubleshooting |
| Scale | Expand usage or contribute back | Advanced material, operational guidance, contribution pathways |

Education can support the entire journey, not just Learn. Add journey-stage alignment to objectives and content maps when it clarifies the brief.

## Segmentation and Decision Roles

Consider:
- Technical filters: experience, language/framework familiarity, domain knowledge.
- User roles: individual contributor, team lead, architect.
- Organization context: startup or enterprise, regulated requirements, available resources.
- Market context: geography, language, culture, and access constraints.

Distinguish roles in the Developer Decision Making Unit (DDMU):

| Role | Information need |
|------|------------------|
| Initiator | Recognize the problem and possible approaches |
| Technical decision maker | Evaluate fit, integration, and technical tradeoffs |
| Influencer | Share evidence and explain alternatives |
| Economic buyer | Understand costs, risks, and organizational outcomes |

One person may occupy several roles. Do not assume the learner controls purchasing decisions.

## Community and Contributor Pathways

Following Nadia Eghbal's *Working in Public* (2020), support both:
- Casual contributors: self-contained, just-in-time guidance, minimal context, a small first contribution.
- Active contributors: comprehensive onboarding, sustained relationships, deeper context, and growth pathways.

Make onboarding, contribution guides, help channels, maintainer expectations, and recognition visible. Do not require long-term community engagement to succeed at a short learning task.

## Friction Logging

Step through the experience using the target segment's prerequisites and environment. Record missing information, incorrect information, confusing presentation, and unnecessary complexity. Prioritize fixes by impact and frequency.

Use the general [Evaluation & Iteration](../evaluation-iteration/SKILL.md) process for the log and pilot plan. In DevRel work, include access, account creation, credentials setup, quickstart execution, documentation transitions, and contribution handoffs where relevant.

## Business-to-Developer Context

Connect skills instruction to what developers can create. Use authentic possibilities, preserve learner autonomy, and make platform limitations explicit. Do not turn learning outcomes into promotional claims or equate conversion with competence.

Use [Developer Education](../developer-education/SKILL.md) for programming pedagogy; DevRel strategy is not a substitute for code comprehension, practice, or assessment.

## Templates

Content map (CSV):

```csv
Artifact,Segment,JourneyStage,LearningEvidence,ProgramMetric,Owner
Quickstart,New platform user,Learn,Completes core task without hints,Successful first run rate,Education team
Capability demo,Technical decision maker,Evaluate,Explains fit and limitations,Qualified evaluation starts,Developer advocate
```

Contributor pathway CSV:
```csv
Role,PathwayStart,OnboardingArtifact,Support,Recognition
Casual,Docs page,One-page guide,Maintainer help channel,Contribution acknowledgment
Active,Contributor hub,Structured onboarding,Mentor and community sessions,Maintainer-reviewed milestones
```

Outreach plan fields: audience segment, asset, channel, timing, owner, support capacity, and success measure.

## Validation

- Learning objectives and assessments remain explicit alongside program goals.
- Journey stages and segments are justified, not imposed on unrelated learning.
- Both short-term and sustained contribution pathways have appropriate support.
- Metrics distinguish mastery, transfer, adoption, and community participation.
- Friction findings and representative learner review are documented or clearly planned.

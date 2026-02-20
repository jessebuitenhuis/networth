---
name: iterate
description: Plan the next iteration of the app and update the PRD
allowed-tools: Read, Grep, Glob, AskUserQuestion, Task, Write, Edit
argument-hint: "<input: user test feedback file, feature ideas, or description of what to consider>"
disable-model-invocation: true
---

# Plan Next Iteration Skill

Take input (`$ARGUMENTS`) — user test feedback, feature ideas, technical debt, or any combination — and guide the PRD through a structured update process.

## Preparation

Read the following to understand the current state:

- `PRD.md` — current product requirements, user stories, and their status
- Recent git history (`git log --oneline -30`) — understand what was built recently
- `$ARGUMENTS` — the input to consider for this iteration (file path or inline description)

## Steps

### 1. Brainstorm: Think critically about the app's direction

**Always do this step, regardless of how specific the input is.**

Analyze the app against its stated goal in the PRD summary. Think about:

- **What's the goal of this app?** What does the PRD summary promise?
- **Where are the gaps?** What would a user expect from this app that's missing?
- **What are the alternatives?** What does a spreadsheet (or competing tool) still do better?
- **What makes this app uniquely valuable?** What can it do that alternatives can't?
- **What's the input telling us?** What themes emerge from the feedback/ideas?

Present this analysis to the user as a structured brainstorm. Be opinionated — propose ideas beyond what was explicitly requested. Challenge assumptions. Identify what moves the needle most.

End the brainstorm with a proposed shortlist of items for the iteration. Use the `AskUserQuestion` tool to get the user's reaction and adjust.

### 2. Clarify specifics

For each item that needs design decisions, ask clarifying questions **one at a time** using `AskUserQuestion`. Focus on:

- **User intent** — What outcome does the user want, not what UI should we build?
- **Scope boundaries** — What's in, what's explicitly deferred?
- **Design choices** — When multiple valid approaches exist, present options with trade-offs

Guidelines:

- Don't ask about things you can infer from the codebase or PRD
- Provide sensible default options so the user can move quickly
- Stop asking once you have enough clarity to write stories

### 3. Propose PRD changes

Present the proposed changes as a summary **before editing**. The user must approve before any file is modified.

The proposal should list:

- New user stories (with epic assignment)
- Existing stories to modify (with what changes and why)
- Any structural changes to the PRD (new/renamed epics, moved stories)

### 4. Update the PRD

**Only after user approval**, edit `PRD.md`.

## Writing rules

Follow these rules strictly when writing or modifying the PRD:

### User stories are about outcomes, not implementations

- **Good**: "As a user, I want to see my financial progress toward goals, so I have motivation to stay on track"
- **Bad**: "Create a goal progress card component on the dashboard page"

### One unified document, not iterations

- The PRD describes what the app **is**, not what was built when
- Use the Status column (`Done`, `Partial`, `Planned`) to track progress
- Never create separate "Iteration 2" or "Phase 2" sections

### Evolve existing stories, don't contradict them

- When a story's scope grows, update the existing story and set status to `Partial`
- Never create a new story that contradicts an existing one
- Fold implementation details into their parent story rather than creating a new story

### Epics describe user value, not technical components

- **Good**: "Tracking my finances", "Planning my future", "Seeing my progress"
- **Bad**: "Account Management", "Charts & Visualization", "API Layer"
- When a story could live in multiple epics, choose the one that best matches the value the user gets

### Keep IDs sequential

- When adding stories, continue from the highest existing ID
- When removing stories, renumber to close gaps

### UX guidance belongs in the UX Principles section

- Implementation conventions (button placement, layout patterns) are not user stories
- If a UX pattern applies across the app, add it to the UX Principles section
- Each principle should explain what the user gets out of it

### Key Features reflects the full vision

- Update the Key Features section when the app's scope changes meaningfully
- Keep features concise — one line each

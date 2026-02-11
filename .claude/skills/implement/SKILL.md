---
name: implement
description: Clarify requirements for a user story and create an implementation plan
allowed-tools: Read, Grep, Glob, AskUserQuestion, EnterPlanMode, ExitPlanMode, Task
argument-hint: "<user story or feature description>"
---

# Implement User Story Skill

Take a user story (`$ARGUMENTS`) through requirements clarification and implementation planning.

## Steps

### 1. Understand the user story

Read `$ARGUMENTS` and identify:
- The core goal of the story
- Which parts of the codebase are likely affected
- What is ambiguous or underspecified

Explore the codebase to understand the current state of relevant code before asking questions.

### 2. Clarify requirements

Ask clarifying questions **one at a time** using the `AskUserQuestion` tool. Each question should resolve a specific ambiguity or missing detail.

Focus on:
- **Behavior**: What exactly should happen? What are the edge cases?
- **UI/UX**: How should it look and feel? What interactions are involved?
- **Data**: What data structures are needed? How does it relate to existing models?
- **Scope**: What is explicitly out of scope for this story?

Guidelines:
- Only ask questions where the answer meaningfully affects the implementation
- Stop asking once you have enough clarity to produce a concrete plan
- Don't ask about things you can infer from the codebase or PRD (`PRD.md`)
- Provide sensible default options so the user can move quickly

### 3. Create the implementation plan

Once requirements are clear, enter plan mode using `EnterPlanMode` and produce a detailed implementation plan that follows TDD:

1. **Write tests first** — list the test files and test cases to create
2. **Implement** — list the production files to create or modify, and describe what each change does
3. **Verify** — plan ends with running `npm run dev` to confirm everything works end-to-end

The plan should:
- Follow existing patterns and conventions in the codebase
- Keep changes minimal and focused on the story
- Reference specific files and locations in the codebase
- Break work into small, testable increments

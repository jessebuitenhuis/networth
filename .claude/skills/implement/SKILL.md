---
name: implement
description: Clarify requirements for a user story and create an implementation plan
allowed-tools: Read, Grep, Glob, AskUserQuestion, EnterPlanMode, ExitPlanMode, Task, Skill
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

1. **Create a worktree** — use the `/worktree` skill to create an isolated worktree for this feature, then do all subsequent work inside it
2. **Write tests first** — list the test files and test cases to create
3. **Implement** — list the production files to create or modify, and describe what each change does
4. **Verify** — run `npm run dev:random-port` to confirm everything works end-to-end
5. **Commit** — use the `/commit` skill to commit the changes inside the worktree
6. **Review** — start a dev server with `npm run dev:random-port` **in the background** so the user can interact with the app. Share the URL with the user and ask them to review the changes. **CRITICAL: Keep the server running and WAIT for explicit user approval before proceeding. DO NOT merge without approval.**
7. **Merge & cleanup** — **ONLY after the user explicitly approves**, stop the dev server, then use the `/worktree` skill to merge the branch into main and remove the worktree

The plan should:
- Follow existing patterns and conventions in the codebase
- Keep changes minimal and focused on the story
- Reference specific files and locations in the codebase
- Break work into small, testable increments

## CRITICAL: Review and Approval Process

**DO NOT MERGE WITHOUT EXPLICIT USER APPROVAL**

After completing step 6 (Review), you MUST:
1. Keep the dev server running in the background
2. Share the URL with the user
3. Wait for the user to review the changes
4. **STOP and wait for explicit approval** (e.g., "looks good", "approved", "merge it")
5. Only proceed to step 7 (Merge & cleanup) after receiving approval

If the user requests changes during review:
- Stop the dev server
- Make the requested changes in the worktree
- Commit the changes with `/commit`
- Restart the dev server for another review cycle
- Repeat until approval is given

**Never assume approval. Always wait for the user to explicitly say they approve.**

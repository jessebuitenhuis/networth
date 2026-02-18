---
name: implement
description: Clarify requirements for a user story and create an implementation plan
allowed-tools: Read, Write, Edit, Grep, Glob, AskUserQuestion, EnterPlanMode, ExitPlanMode, Task, Skill, Bash
argument-hint: "<user story or feature description>"
---

# Implement User Story Skill

Take a user story (`$ARGUMENTS`) through requirements clarification and implementation planning.

## Current State

### Verification

!`npm run verify > /dev/null 2>&1 && echo "✓ verify passed" || echo "✗ verify failed"`

## Steps

### 1. Check verification and understand the user story

**First**, check the verification output above:

- If `npm run verify` shows **any failures** (lint, build, or test), **STOP** and notify the user that the codebase is not in a clean state. Do not proceed with planning until the user confirms they want to continue despite failures, or fixes the issues first.
- If verification passes, proceed with understanding the user story.

**Then**, read `$ARGUMENTS` and identify:

- The core goal of the story
- Which parts of the codebase are likely affected
- What is ambiguous or underspecified

**Finally**, explore the codebase to understand the current state of relevant code before asking questions.

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

Once requirements are clear, enter plan mode using `EnterPlanMode` and produce a detailed implementation plan that follows TDD.

The plan MUST follow this skeleton exactly. Steps 1 and 5–8 are fixed workflow steps — do not omit or reorder them. Steps 2–4 are where you fill in implementation-specific details.

#### MANDATORY PLAN TEMPLATE

1. **Create a worktree** **(DO NOT SKIP)** — use the `/worktree` skill to create an isolated worktree for this feature. ALL subsequent work (tests, implementation, commits, dev server) happens inside this worktree.
2. **Write tests first** — [List the test files to create/modify and the specific test cases for each]
3. **Implement** — [List the production files to create/modify and describe what each change does]
4. **Verify** — run `npm run dev:random-port` inside the worktree to confirm everything works end-to-end
5. **Review** — you MUST start the dev server yourself with `npm run dev:random-port` **in the background** inside the worktree, then read the output to find the URL (e.g., `http://localhost:<port>`). Share the exact URL with the user along with step-by-step instructions for what to test (e.g., "1. Open http://localhost:4523 2. Click Accounts in the sidebar 3. Click 'Add Account'..."). **CRITICAL: YOU start the server — do NOT tell the user to run it. Keep the server running and WAIT for explicit user approval before proceeding. DO NOT merge without approval.**
6. **Update PRD** — edit `PRD.md` to change the Status of the implemented user story from `Planned` to `Done` in the markdown table row matching the story ID, then commit with `/commit`
7. **Merge & cleanup** — **ONLY after the user explicitly approves**, stop the dev server, then use the `/worktree` skill to merge the branch into main and remove the worktree

The plan should:

- Follow existing patterns and conventions in the codebase
- Keep changes minimal and focused on the story
- Reference specific files and locations in the codebase
- Break work into small, testable increments

## CRITICAL: Review and Approval Process

**DO NOT MERGE WITHOUT EXPLICIT USER APPROVAL**

After completing step 6 (Review), you MUST:

1. Start the dev server yourself using `npm run dev:random-port` in the background (using Bash with `run_in_background`)
2. Read the server output to extract the actual URL
3. Share the exact URL (e.g., `http://localhost:4523`) with step-by-step manual testing instructions specific to the feature you implemented
4. Keep the dev server running in the background
5. **STOP and wait for explicit approval** (e.g., "looks good", "approved", "merge it")
6. Only proceed to step 7 (Update PRD) and step 8 (Merge & cleanup) after receiving approval

If the user requests changes during review:

- Stop the dev server
- Make the requested changes in the worktree
- Commit the changes with `/commit`
- Restart the dev server for another review cycle
- Repeat until approval is given

**Never assume approval. Always wait for the user to explicitly say they approve.**

---
name: worktree
description: Create, work in, merge, and remove git worktrees
allowed-tools: Bash, Read
---

# Git Worktree Workflow

Git worktrees let you work on multiple branches simultaneously without stashing or switching. All worktrees live in `.worktrees/` at the project root.

## Create

When creating a worktree, ALWAYS run these commands in sequence:

```bash
git branch <branch-name>
git worktree add .worktrees/<name> <branch-name>
cd .worktrees/<name> && npm install
```

**CRITICAL**: The `npm install` step is MANDATORY after creating a worktree to ensure dependencies are properly installed in the new working directory. Use `&&` to chain the commands so npm install runs automatically after changing to the worktree directory.

## Work

Run all commands from inside the worktree directory:

```bash
cd .worktrees/<name>
npm test
npm run dev:random-port
```

## Merge

You can't checkout `main` from a worktree (it's already checked out in the main repo). Merge from outside:

```bash
git -C <main-repo-path> merge <branch-name>
```

## Remove

**CRITICAL**: Always remove a specific worktree by name. NEVER use `rm -rf .worktrees` without a specific name, as this deletes ALL worktrees and loses any uncommitted work.

```bash
git worktree remove .worktrees/<name>
git branch -d <branch-name>
```

If not in the main repo directory:

```bash
git -C <main-repo-path> worktree remove .worktrees/<name>
git -C <main-repo-path> branch -d <branch-name>
```

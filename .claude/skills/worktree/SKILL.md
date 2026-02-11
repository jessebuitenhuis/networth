---
name: worktree
description: Create, work in, merge, and remove git worktrees
allowed-tools: Bash, Read
argument-hint: ""
---

# Git Worktree Workflow

Git worktrees let you work on multiple branches simultaneously without stashing or switching. All worktrees live in `.worktrees/` at the project root.

## Create

```bash
git branch <branch-name>
git worktree add .worktrees/<name> <branch-name>
cd .worktrees/<name>
npm install
```

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

```bash
git -C <main-repo-path> worktree remove .worktrees/<name>
git -C <main-repo-path> branch -d <branch-name>
```

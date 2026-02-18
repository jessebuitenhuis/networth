---
name: commit
description: Creates a well-formated conventional git commit
context: fork
allowed-tools: Bash(git *), Bash(sed *), Bash(node *)
agent: Basher
---

Your ONLY job is to verify the build, test and lint and create a well formatted conventional git commit.

All information is in this prompt, you don't have to rerun the scripts.

## 1. Format

- `npm run format`: !`node .claude/skills/commit/run-no-ansi.js npm run format || true`

## 2. Verify

- `npm run build`: !`node .claude/skills/commit/run-no-ansi.js npm run build || true`
- `npm run lint`: !`node .claude/skills/commit/run-no-ansi.js npm run lint || true`
- `npm run test`: !`node .claude/skills/commit/run-no-ansi.js npm run test || true`

**STOP ON FAILURE**: When any of the scripts fails, stop and report the errors.

# 3. Commit

Create a verifed, well formatted conventional git commit.

- `git status`: !`git status`
- `git diff`: !`git diff`
- `git log --oneline -n 5`: !`git log --oneline -n 5`

---
name: commit
description: Verify build/test/lint pass, then create a conventional commit
allowed-tools: Bash, Read, Grep, Glob
argument-hint: "[optional commit message override]"
---

# Commit Skill

Create a verified, well-formatted git commit following the Conventional Commits specification.

## Current state

### Verification
!`npm run verify 2>&1`

### Git status
!`git status`

### Changed files (stat)
!`git diff --stat`

### Full diff
!`git diff`

### Recent commits
!`git log --oneline -5`

## Steps

### 1. Check verification

If `npm run verify` above shows any failures, stop — report the failure and help fix the issue. **Do not commit.**

### 2. Stage and commit

Based on the status and diff above:

- **Never** stage secrets (`.env`, credentials, tokens).
- **Never** use `git add -A` or `git add .`. Stage files individually.
- Use the **Conventional Commits** format with a HEREDOC.
- Confirm with `git log --oneline -1` after committing.

Run staging, commit, and confirmation in a **single** Bash call:

```bash
git add <file1> <file2> ... && git commit -m "$(cat <<'EOF'
<type>(<optional scope>): <short summary>

<optional body>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)" && git log --oneline -1
```

## Commit Message Format

```
<type>(<optional scope>): <short summary>

<optional body>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

Rules:
- Summary is imperative, lowercase, no period, max 72 chars.
- Body wraps at 72 chars and explains *why*, not *what*.
- If `$ARGUMENTS` is provided, use it as the summary (still apply formatting rules).
- Pick the most specific type that applies.

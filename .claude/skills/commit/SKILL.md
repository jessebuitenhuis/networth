---
name: commit
description: Verify build/test/lint pass, then create a conventional commit
allowed-tools: Bash, Read, Grep, Glob
argument-hint: "[optional commit message override]"
---

# Commit Skill

Create a verified, well-formatted git commit following the Conventional Commits specification.

## Steps

### 1. Pre-commit verification

Run all checks **sequentially** — stop immediately on first failure:

```
npm run lint
npm run build
```

If tests are configured (`test` script exists in package.json and is not the default placeholder), also run:

```
npm test
```

If **any** check fails, report the failure clearly and **do not commit**. Help fix the issue instead.

### 2. Stage changes

- Run `git status` and `git diff --stat` to understand what changed.
- Stage relevant files individually (`git add <file>`). Never use `git add -A` or `git add .`.
- Do not stage files that contain secrets (`.env`, credentials, tokens).

### 3. Write the commit message

Use the **Conventional Commits** format:

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

### 4. Create the commit

Use a HEREDOC to pass the message:

```bash
git commit -m "$(cat <<'EOF'
<message here>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

### 5. Confirm

Run `git log --oneline -1` and report success.

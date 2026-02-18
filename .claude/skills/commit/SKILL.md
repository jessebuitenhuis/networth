---
name: commit
description: Creates a well-formated conventional git commit
context: fork
allowed-tools: Bash(git *)
agent: Basher
---

Your ONLY job is to verify the build, test and lint and create a well formatted conventional git commit.

1. Run build, test and lint.
2. Run format.
3. If any fails, stop and report back.
4. Create a verfied, well formatted conventional git commit.

---
name: analyze-tokens
description: Analyze Claude Code session token usage patterns and identify optimization opportunities
allowed-tools: Bash, Read, Write, Glob
argument-hint: "[optional: specific focus area or hypothesis to test]"
disable-model-invocation: true
---

# Token Usage Analysis Skill

Analyze recent Claude Code sessions to identify token usage patterns and optimization opportunities.

## What This Skill Does

Runs a Python analysis script against recent session `.jsonl` files to:

- Identify the largest tool outputs (Read, Bash, Task, etc.)
- Detect patterns like test/coverage outputs, verify runs, duplicate file reads
- Calculate token costs and potential savings
- Generate a detailed report with recommendations

## Usage

```bash
/analyze-tokens [optional focus area]
```

Examples:

- `/analyze-tokens` — full analysis of 5 most recent sessions
- `/analyze-tokens verify outputs` — focus on npm run verify patterns
- `/analyze-tokens test coverage` — focus on test/coverage outputs
- `/analyze-tokens file reads` — focus on Read tool usage

## Steps

### 1. Find recent sessions

```bash
find ~/.claude/projects/-Users-jessebuitenhuis-Development-networth -name "*.jsonl" -type f -not -path "*/subagents/*" -exec ls -lt {} + | head -10
```

Identify the 5 most recent main session files (not subagent files).

### 2. Run analysis on each session

The analysis script is located at `.claude/skills/analyze-tokens/scripts/analyze-session.py` relative to this skill.

For each of the 5 sessions:

```bash
python3 .claude/skills/analyze-tokens/scripts/analyze-session.py <path-to-session.jsonl>
```

### 3. Summarize findings

After analyzing all sessions, create a summary report that includes:

**Pattern Summary Table:**
| Pattern | Sessions Found | Avg Tokens | Total Impact |
|---------|---------------|------------|--------------|
| Test/coverage outputs | X/5 | ~X,XXX | HIGH/MED/LOW |
| npm verify outputs | X/5 | ~X,XXX | HIGH/MED/LOW |
| Large file reads | X/5 | ~X,XXX | HIGH/MED/LOW |
| Duplicate reads | X/5 | ~X,XXX | HIGH/MED/LOW |

**Top 3 Optimization Opportunities:**

1. [Most impactful pattern] — potential savings: ~X,XXX tokens/session
2. [Second pattern] — potential savings: ~X,XXX tokens/session
3. [Third pattern] — potential savings: ~X,XXX tokens/session

**Focused Analysis (if $ARGUMENTS provided):**
Deep dive into the specific area requested, with examples from the sessions.

### 4. Optional: Generate recommendations

If optimization opportunities are found, suggest specific actions:

- Script changes (new npm scripts, wrapper scripts)
- Skill modifications (update `!` backtick commands)
- Memory guidance (add to MEMORY.md)
- Code changes (modify tool usage patterns)

## Notes

- The script uses character count / 4 as a rough token estimate
- Cache read tokens are reported but not broken down (they're unavoidable context)
- Focus on patterns that appear frequently and have high token counts
- The most impactful optimizations target tool outputs that add no value when clean

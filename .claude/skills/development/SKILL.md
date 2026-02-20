---
name: development
description: General best practices for coding. Use this when writing, analyszing or reviewing code
---

- Short names acceptable when context is clear
- Prefix private members with `_`
- Prefer short, clearly named method calls over comments
- Limit code nesting to 1-2 levels
- One type per file (class, type, interface, enum)
- Boolean naming: `is*`, `has*`, `can*`
- TDD workflow: write tests first, then implement
- Page Object pattern (`*.page.tsx`) for dialog/form test infrastructure
- Organize code by domain, not by technology (`src/accounts/`, `src/transactions/`, etc.)

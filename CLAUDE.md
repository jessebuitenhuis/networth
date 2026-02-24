# Net Worth Tracker

Personal finance app for tracking net worth across multiple accounts. Users manage accounts, record transactions, and visualize net worth over time via an interactive chart. See `PRD.md` for full product requirements and `docs/epics/` for detailed epic specifications.

## Directory Structure

```
docs/
  epics/            # Detailed epic specifications and implementation notes
src/
  accounts/         # Account domain: types, context, repository, services, components
    components/     # Account UI components (AccountIcon, dialogs, NetWorthCard, etc.)
  transactions/     # Transaction domain: types, context, repository, services, components
    components/     # Transaction UI components (TransactionList, dialogs, etc.)
    import/         # CSV import sub-domain: types, services, ImportCsvDialog
  recurring-transactions/  # Recurring transaction domain: types, context, repository, services
  scenarios/        # Scenario domain: types, context, repository
    components/     # Scenario UI components (dialogs, pickers, etc.)
  goals/            # Goal domain: types, context, repository, services
    components/     # Goal UI components (GoalCard, GoalList, dialogs, progress, etc.)
  charts/           # Chart domain: types, services, components
    planning/       # Planning chart sub-domain: date windows, date points, series computation
    components/     # Chart UI components (NetWorthChart, PeriodPicker, legends, etc.)
  app/              # Next.js App Router pages
    api/            # API route handlers (CRUD for each entity)
  components/       # Shared UI components only
    layout/         # App shell (sidebar, layout wrapper)
    shared/         # Reusable non-shadcn components (MultiSelectPicker, CurrencyInput, etc.)
    ui/             # shadcn/ui primitives (do not edit directly)
  categories/       # Category domain: types, context, repository, components
    components/     # Category UI components (CategorySelect, dialogs, etc.)
  db/               # Database schema (Drizzle) and connection singleton
  hooks/            # Custom React hooks
  lib/              # Generic utility functions (dateUtils, formatCurrency, generateId, tree utils, etc.)
  test/             # Test setup and configuration
```

## Commands

Use these npm scripts — they go through turbo and benefit from caching. Do **not** invoke `next build`, `eslint`, or `vitest` directly for full runs, as that bypasses the cache.

| Task | Command |
|---|---|
| Run all tests | `npm run test` |
| Run specific tests | `npm run test -- -- <filter>` (e.g. `npm run test -- -- src/accounts`) |
| Build | `npm run build` |
| Lint | `npm run lint` |
| Lint + auto-fix | `npm run format` |
| All checks (lint + build + test + smoke) | `npm run verify` |
| Test coverage | `npm run test:coverage` |

> **Note:** The `<filter>` for specific tests is a substring/regex matched against file paths (e.g. `src/accounts`, `accountRepository`). The double `--` is required: the first passes through npm, the second through turbo, so the filter reaches vitest.

## Workflow

- When implementing a user story from PRD.md or detail from an epic doc, mark it as done when completed
- Branch is automatically rebased onto origin/main before each stop (via Stop hook in `.claude/settings.json`). If a rebase conflict occurs, resolve it before proceeding.

## Coding Guidelines

- Short names acceptable when context is clear
- Prefix private members with `_`
- Prefer short, clearly named method calls over comments
- Limit code nesting to 1-2 levels
- One type per file (class, type, interface, enum)
- Boolean naming: `is*`, `has*`, `can*`
- TDD workflow: write tests first, then implement
- Page Object pattern (`*.page.tsx`) for dialog/form test infrastructure
- Organize code by domain, not by technology (`src/accounts/`, `src/transactions/`, etc.)

### Frontend development

- Use constructor shorthand for parameter declaration when possible (`constructor(private _someVar: string) {}`)
- Initialize class fields inline when possible (`private _map = new Map()` instead of in constructor)
- Import sorting enforced via `eslint-plugin-simple-import-sort`; run `npm run format` to auto-fix
- Use shadcn/ui components over native HTML elements
- Use smart/dumb component pattern
- Smart container components hold state and logic
- Dumb presentational components communicate through props (no side effects)

### Testing

- Use `it.each()` for parameterized tests (3+ cases with same structure)
- Use page object pattern (`*.page.tsx`) to eliminate duplicated query and interaction logic across tests — when multiple tests repeat the same `screen.getBy*`, `user.click`, `user.type`, or `user.clear` sequences, extract them into a page object so tests read as intent, not mechanics

### Principles

- **Single Responsibility Principle** — Each component or function should do one thing well. If a component handles both viewing and creating, split it into separate components. A file growing long (many imports, inline computation, or comments separating sections) is a signal to extract hooks, helpers, or sub-components.
- **Open/Closed Principle** — Prefer data-driven patterns (e.g. column definition lists, configuration arrays) over switch statements or if/else chains. New behavior should be added by extending data, not modifying existing logic.
- **Code should read like a book** — Each function should operate at a single level of abstraction. Flatten nested loops and conditionals by using guard clauses (`continue`/`return`), functional transforms (`.filter`, `.flatMap`), or by extracting inner logic into clearly named functions. If reading a function requires tracking more than 1-2 levels of indentation, refactor it.
- **DRY shared logic** — Extract duplicated logic into `src/lib/` for generic utilities or `src/components/shared/` for reusable UI components. Domain-specific helpers belong in their domain folder.

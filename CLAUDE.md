# Net Worth Tracker

Personal finance app for tracking net worth across multiple accounts. Users manage accounts, record transactions, and visualize net worth over time via an interactive chart. See `PRD.md` for full product requirements.

## Directory Structure

```
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
    components/     # Chart UI components (NetWorthChart, PeriodPicker, legends, etc.)
  app/              # Next.js App Router pages
    api/            # API route handlers (CRUD for each entity)
  components/       # Shared UI components only
    layout/         # App shell (sidebar, layout wrapper)
    shared/         # Reusable non-shadcn components (MultiSelectPicker, CurrencyInput, etc.)
    ui/             # shadcn/ui primitives (do not edit directly)
  categories/       # Category domain: types, context, repository, components
    components/     # Category UI components (CategoryList, CategorySelect, dialogs, etc.)
  db/               # Database schema (Drizzle) and connection singleton
  hooks/            # Custom React hooks
  lib/              # Generic utility functions (dateUtils, formatCurrency, generateId, tree utils, etc.)
  test/             # Test setup and configuration
```

## Pull Requests

Before creating a PR, ensure the target branch is up to date. Fetch and rebase:

```bash
git fetch origin main
git rebase origin/main
```

## Workflow

- When implementing a user story from PRD.md, mark it as done when completed§

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

### Principles

- **Single Responsibility Principle** — Each component or function should do one thing well. If a component handles both viewing and creating, split it into separate components.
- **Open/Closed Principle** — Prefer data-driven patterns (e.g. column definition lists, configuration arrays) over switch statements or if/else chains. New behavior should be added by extending data, not modifying existing logic.
- **DRY shared logic** — Extract duplicated logic into `src/lib/` for generic utilities or `src/components/shared/` for reusable UI components. Domain-specific helpers belong in their domain folder.

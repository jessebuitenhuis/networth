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

## Architecture Preferences

- **One export per file** — Each file should export a single function, type, or component. This keeps files focused and imports explicit.
- **Single Responsibility Principle** — Each component or function should do one thing well. If a component handles both viewing and creating, split it into separate components.
- **Small, focused functions** — Functions should be short and do one thing. If a function is getting long, extract named sub-functions. Each extracted function should live in its own file (one export per file).
- **Named functions over comments** — Replace explanatory comments with clearly named functions. Code should read like a book without needing comments to explain intent (e.g. `findClosestNetWorthAtDate` instead of `// Assumes series is sorted ascending by date`).
- **Limit nesting depth** — Limit nesting of control flow (for, if, while) to 1 level deep, or 2 when really needed. Flatten deeply nested logic using early returns, `.filter()/.flatMap()`, or by extracting inner logic into named functions.
- **Separate data from rendering** — In React components, extract data-fetching and computation logic into custom hooks. Components should focus on rendering.
- **Open/Closed Principle** — Prefer data-driven patterns (e.g. column definition lists, configuration arrays) over switch statements or if/else chains. New behavior should be added by extending data, not modifying existing logic.
- **DRY shared logic** — Extract duplicated logic into `src/lib/` for generic utilities or `src/components/shared/` for reusable UI components. Domain-specific helpers belong in their domain folder.
- **DialogFooterActions** — Use the shared `DialogFooterActions` component (`src/components/shared/DialogFooterActions.tsx`) for consistent Cancel/Submit button groups in dialog forms.

## Pull Requests

Before creating a PR, ensure the target branch is up to date. Fetch and rebase:
```bash
git fetch origin main
git rebase origin/main
```

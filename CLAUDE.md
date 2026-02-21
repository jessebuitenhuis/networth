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
- **Open/Closed Principle** — Prefer data-driven patterns (e.g. column definition lists, configuration arrays) over switch statements or if/else chains. New behavior should be added by extending data, not modifying existing logic.
- **DRY shared logic** — Extract duplicated logic into `src/lib/` for generic utilities or `src/components/shared/` for reusable UI components. Domain-specific helpers belong in their domain folder.
- **DialogFooterActions** — Use the shared `DialogFooterActions` component (`src/components/shared/DialogFooterActions.tsx`) for consistent Cancel/Submit button groups in dialog forms.

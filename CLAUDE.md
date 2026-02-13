# Net Worth Tracker

Personal finance app for tracking net worth across multiple accounts. Users manage accounts, record transactions, and visualize net worth over time via an interactive chart.

See `PRD.md` for full product requirements.

## Tech Stack

- **Framework**: Next.js 16 (App Router, `src/` directory)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix primitives)
- **Charts**: Recharts
- **Testing**: Vitest + React Testing Library + jsdom
- **Linting**: ESLint with next/core-web-vitals + next/typescript
- **Build orchestration**: Turborepo (`turbo.json`)
- **Path alias**: `@/*` maps to `./src/*`

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev:random-port` | Dev server on auto-assigned port (avoids collisions) |
| `npm run build` | Production build |
| `npm test` | Single test run with coverage |
| `npm run test:watch` | Watch mode |
| `npm run verify` | Lint + build + test via Turborepo |
| `npm run format` | Auto-fix lint issues (import sorting, etc.) |

## Architecture

### Smart/Dumb Component Pattern

- **Smart (container) components** live in `src/components/{feature}/` and consume React contexts directly. They hold state and logic.
- **Dumb (presentational) components** receive all data via props. No context usage, no side effects.
- Example: `AccountList` (smart) uses `useAccounts()` context, passes data to `AccountListItem` (dumb).

### State Management

- React Context + `useReducer` for all domain entities
- Contexts defined in `src/context/` — `AccountContext`, `TransactionContext`, `RecurringTransactionContext`, `ScenarioContext`
- All persist to `localStorage` via services in `src/services/`

### Storage Layer

- `localStorage`-based with an abstraction layer (`AccountStorage`, `TransactionStorage`, `RecurringTransactionStorage`, `ScenarioStorage`)
- Storage keys: `"accounts"`, `"transactions"`, `"recurringTransactions"`, `"scenarios"`, `"activeScenarioId"`
- Designed for future migration to a server-backed solution

### Data Flow

```
localStorage -> Storage services -> Context providers -> Smart components -> Dumb components
```

## Directory Structure

```
src/
  app/              # Next.js App Router pages
  components/       # UI components (smart + dumb)
    accounts/       # Account-related components
    charts/         # Net worth chart + legend + period picker
    layout/         # App shell (sidebar, layout wrapper)
    scenarios/      # Scenario management components
    transactions/   # Transaction-related components
    ui/             # shadcn/ui primitives (do not edit directly)
  context/          # React context providers (AccountContext, TransactionContext)
  hooks/            # Custom React hooks
  lib/              # Pure utility functions
  models/           # TypeScript types and enums
  services/         # Storage and computation logic
  test/             # Test setup and configuration
```

## Key Conventions

- One type per file (class, type, interface, enum)
- Boolean naming: `is*`, `has*`, `can*`
- TDD workflow: write tests first, then implement
- Use shadcn/ui components over native HTML elements
- Verify with `npm run dev:random-port` after features (not just `npm run build`)
- Page Object pattern (`*.page.tsx`) for dialog/form test infrastructure
- Mock utilities in `src/test/mocks/` for non-universal mocks (ResizeObserver, Recharts warnings)
- Use `it.each()` for parameterized tests (3+ cases with same structure)
- Import sorting enforced via `eslint-plugin-simple-import-sort`; run `npm run format` to auto-fix

## Known Issues

- shadcn init adds `@import "tw-animate-css"` but Turbopack can't resolve it — must use `@import "../../node_modules/tw-animate-css/dist/tw-animate.css"` instead

# Net Worth Tracker

Personal finance app for tracking net worth across multiple accounts. Users manage accounts, record transactions, and visualize net worth over time via an interactive chart.

See `PRD.md` for full product requirements.

## Tech Stack

- **Framework**: Next.js 16 (App Router, `src/` directory)
- **Language**: TypeScript (strict mode)
- **Database**: SQLite via better-sqlite3 + Drizzle ORM
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
| `npm test` | Single test run without coverage |
| `npm run test:coverage` | Single test run with coverage |
| `npm run test:watch` | Watch mode |
| `npm run test:quiet` | Test run with dot reporter and coverage (compact output) |
| `npm run verify` | Lint + build + test:coverage via Turborepo |
| `npm run verify:quiet` | Same as verify, but suppresses output on success |
| `npm run format` | Auto-fix lint issues (import sorting, etc.) |

## Architecture

### Smart/Dumb Component Pattern

- **Smart (container) components** live in `src/components/{feature}/` and consume React contexts directly. They hold state and logic.
- **Dumb (presentational) components** receive all data via props. No context usage, no side effects.
- Example: `AccountList` (smart) uses `useAccounts()` context, passes data to `AccountListItem` (dumb).

### State Management

- React Context + `useReducer` for all domain entities
- Contexts defined in `src/context/` — `AccountContext`, `TransactionContext`, `RecurringTransactionContext`, `ScenarioContext`
- Contexts fetch/mutate via Next.js API routes (server-side SQLite)

### Storage Layer

- **Database**: SQLite file at `DATABASE_PATH` env var or `data/networth.db`
- **ORM**: Drizzle ORM with schema in `src/db/schema.ts`
- **Connection**: Singleton in `src/db/connection.ts` (WAL mode, auto-creates tables)
- **API routes**: `src/app/api/{entity}/route.ts` — CRUD endpoints consumed by contexts
- Tables: `accounts`, `transactions`, `recurring_transactions`, `scenarios`, `goals`, `settings`

### Data Flow

```
SQLite -> Drizzle ORM -> API routes -> Context providers -> Smart components -> Dumb components
```

## Directory Structure

```
src/
  accounts/         # Account domain types (Account.type.ts, AccountType.ts)
  transactions/     # Transaction domain types (Transaction.type.ts)
  recurring-transactions/  # Recurring transaction types + enums
  scenarios/        # Scenario domain types (Scenario.type.ts)
  goals/            # Goal domain: type, context, storage, components
  app/              # Next.js App Router pages
    api/            # API route handlers (CRUD for each entity)
  components/       # UI components (smart + dumb)
    accounts/       # Account-related components
    charts/         # Net worth chart + legend + period picker
    layout/         # App shell (sidebar, layout wrapper)
    scenarios/      # Scenario management components
    transactions/   # Transaction-related components
    shared/         # Reusable non-shadcn components (e.g. MultiSelectPicker)
    ui/             # shadcn/ui primitives (do not edit directly)
  context/          # React context providers (AccountContext, TransactionContext)
  db/               # Database schema (Drizzle) and connection singleton
  hooks/            # Custom React hooks
  lib/              # Pure utility functions
  models/           # Shared TypeScript types and enums (non-domain-specific)
  services/         # Computation logic (net worth series, projections, CSV)
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
- Domain types live in their own domain folders (`src/accounts/`, `src/transactions/`, etc.)
- API routes handle persistence via Drizzle ORM; no direct DB access from client code
- Use `generateId()` from `src/lib/generateId.ts` for all UUID generation
- Smart components delegate data transformation to services (e.g. `buildDisplayTransactions`)
- Reusable non-shadcn components go in `src/components/shared/`

## Known Issues

- shadcn init adds `@import "tw-animate-css"` but Turbopack can't resolve it — must use `@import "../../node_modules/tw-animate-css/dist/tw-animate.css"` instead

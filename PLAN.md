# Implementation Plan — App Hierarchy Restructure

Restructure the app navigation from a flat "Main" group with individual account sidebar items to a two-section hierarchy: **Planning** and **Tracking**.

## Current state

```
Sidebar:
  Main
    Dashboard        /
    Planning         /planning
    Timeline         /timeline
    Goals            /goals
    Categories       /categories
  Accounts (dynamic, one item per account)
    Account A        /accounts/[id]
    Account B        /accounts/[id]
    + Create Account
```

## Target state

```
Sidebar:
  Planning
    Projections      /planning
    Goals            /goals
  Tracking
    Transactions     /transactions    (new)
    Accounts         /accounts        (new)
```

Home (`/`) stays as the landing page but is not shown as a nav item — clicking the logo navigates home.

## Steps

### 1. Restructure sidebar nav groups

**Files:** `src/app/layout.tsx`, `src/components/layout/AppLayout.tsx`

- Replace the single "Main" `NavGroup` in `layout.tsx` with two groups: "Planning" (Projections, Goals) and "Tracking" (Transactions, Accounts)
- Remove Dashboard, Timeline, and Categories from nav items
- Remove the dynamic Accounts group from `AppLayout.tsx` — no more individual account items in the sidebar
- Add logo click → navigate to `/` (home) so Dashboard remains accessible
- Keep net worth display somewhere visible (e.g. sidebar header or footer)

### 2. Create Accounts page `/accounts`

**New file:** `src/app/accounts/page.tsx`

- List all accounts with current balances
- Group or sort by account type (checking, savings, investment, mortgage, etc.)
- Show total net worth, total assets, total liabilities at the top
- Each account links to its existing detail page `/accounts/[id]`
- "Create Account" action in the TopBar
- Account edit/delete actions per row (reuse existing `EditAccountDialog`)

The existing `/accounts/[id]` detail page stays unchanged.

### 3. Create Transactions page `/transactions`

**New file:** `src/app/transactions/page.tsx`

- Show all transactions across all accounts in one unified list
- Reuse the existing `TransactionList` component (it already supports an `accountColumn` prop via story #44)
- Add filters: account, category, date range, description search (reuse filter logic from story #29)
- Add a collapsible "Planned" section at the top showing recurring and future transactions
- "Add Transaction" action in the TopBar (reuse `CreateTransactionDialog` with account selector, already built in story #43)
- Scenario filter to show baseline + scenario transactions

### 4. Remove old nav routes

- Delete `/categories` page — categories are already manageable inline via `CategorySelect` in transaction/recurring transaction forms. The `CategoryList` component and `CreateCategoryDialog` can be reused later if an inline management UI is needed.
- Delete `/timeline` page — the `RecurringTransactionTimeline` component stays in the codebase for potential future use but loses its route.
- Clean up any dead imports or references to these routes.

### 5. Update Dashboard

**File:** `src/app/page.tsx`

- Add per-account or per-account-type net worth breakdown (the `NetWorthSummary` currently shows totals only)
- Ensure the dashboard still works well as a unified "where am I + where am I going" landing page — no structural changes needed, just verify it reads correctly without being a nav item

## Out of scope

These are in the PRD hierarchy but are new features, not navigation changes:

- **Budget page** `/budget` — will be added to the Planning nav group when envelope budgeting is built
- **Reports page** `/reports` — will be added to the Tracking nav group when reports are built
- **"What if" wizard** — enhancement to the existing Projections page
- **Inline category management** — categories already work inline via `CategorySelect`; a richer inline editor can be added later if needed

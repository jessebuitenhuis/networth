# Code Review: PR #49 — feat: add per-account balance breakdown to dashboard

## Summary

This PR introduces three main features:
1. **Account balance breakdown on the dashboard** — `AccountBreakdownSection` (smart) + `AccountBalanceList` (presentational)
2. **Dedicated Accounts page** (`/accounts`) and **Transactions page** (`/transactions`) with filtering by account/category
3. **Cleanup** — removes unused pages (`/categories`, `/timeline`) and related components (GanttChart, CategoryList, etc.)

The PR is well-structured overall — new components follow the smart/dumb pattern, tests use the page object pattern, and deleted code is cleanly removed with no dangling imports.

---

## Issues

### 1. Code duplication between `AccountBalanceList` and `AccountSection` (DRY violation)

`AccountBalanceList` (`src/accounts/components/AccountBalanceList.tsx`) and the inline `AccountSection` in `src/app/accounts/page.tsx` share an identical outer structure: same early return, same header layout (title + subtotal), same `divide-y rounded-lg border` container, same row layout with `AccountIcon` + name + formatted balance.

The only differences per row are:
- Dashboard: plain `<span>` for the name, pre-computed `account.balance`
- Accounts page: `<Link>` for the name, `getBalance(account.id)` lookup, plus an `EditAccountDialog` button

Per the project's DRY guideline, consider extracting a shared shell component (e.g., `AccountListSection`) that accepts a `renderRow` prop or children for the per-row content. Both call sites would then only specify what's unique.

### 2. `buildAllDisplayTransactions.ts` has no unit tests

This is a new 87-line pure function with non-trivial logic (mapping transactions + recurring transactions, resolving account names, filtering by scenario, computing category paths). The project guidelines specify TDD workflow. This function is a good candidate for thorough unit testing — especially the edge cases around missing accounts, null scenarios, and the recurring transaction path.

### 3. No tests for `AccountsPage` or `TransactionsPage`

Both new page components contain meaningful logic (filtering, splitting planned vs. actual, net worth calculation) but have no corresponding test files. While some of this logic is covered by the underlying utility tests, integration-level tests for the pages would catch wiring issues.

### 4. `TransactionsPage` mixes concerns — logic-heavy page component

`src/app/transactions/page.tsx` is 124 lines and contains:
- State management (`useState` for filters)
- Data building (`buildAllDisplayTransactions`)
- Filtering and splitting (`filterDisplayTransactions`, planned vs. actual partitioning)
- Two inline factory functions (`editActionForTransaction`, `editActionForRecurring`)
- Complex JSX with a `<details>` collapsible section

Per SRP, consider extracting a `useTransactionsPage()` custom hook or splitting the orchestration logic from the rendering. The edit action factories in particular could be extracted.

### 5. `AccountsPage` duplicates `calculateNetWorth` + filter logic from `AccountBreakdownSection`

Both `AccountsPage` and `AccountBreakdownSection` independently call `calculateNetWorth(accounts, getBalance)` and filter accounts by type. If the net worth calculation or account categorization logic changes, it needs to be updated in two places.

---

## Minor/Nit

- **`src/accounts/components/AccountBalanceList.page.tsx`**: `queryTitle` method just calls `screen.queryByText` — same as `queryByText`. Could be removed or renamed to clarify its purpose.

- **`CLAUDE.md` directory structure comment** still references `CategoryList` in the categories section description. Should be updated since the component was deleted.

- **`PLAN.md` line 74** states "the `RecurringTransactionTimeline` component stays in the codebase" — but it was actually deleted in this PR.

- **`src/app/accounts/page.tsx:86`** — `className="rounded-lg border divide-y"` has utility class ordering different from `AccountBalanceList.tsx:16` (`"divide-y rounded-lg border"`). Consistent class ordering is not critical but is good hygiene.

- **`EditAccountDialog` trigger prop**: The `trigger` is typed as `ReactNode` but there's no validation that it's an element that can receive a ref (required by Radix `asChild`). This could cause runtime warnings if a non-forwardRef component is passed.

- **`DisplayTransaction.type.ts`**: `accountId` is marked optional (`accountId?: string`) — every transaction should have an account. Consider making it required to avoid the defensive `!item.accountId` checks in `filterDisplayTransactions.ts`.

---

## What's Good

- Clean separation into smart/dumb components for the new account breakdown
- Page object pattern used consistently in new tests
- Thorough test coverage for `AccountBalanceList` and `AccountBreakdownSection`
- New filter tests (account/category filtering) are well-structured with clear assertions
- Sidebar navigation updated correctly — no stale route references
- All deleted code is fully removed with zero dangling imports

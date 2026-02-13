# Services

Pure business logic and storage. No React, no UI. All functions are stateless and testable in isolation.

## Storage

### `AccountStorage.ts`

- `loadAccounts()` / `saveAccounts()` — read/write `Account[]` to `localStorage` key `"accounts"`
- `migrateAccountBalances()` — one-time migration from legacy format where accounts had inline `balance` field. Converts balances to opening-balance transactions. Only runs when `"transactions"` key doesn't exist in localStorage yet.

### `TransactionStorage.ts`

- `loadTransactions()` / `saveTransactions()` — read/write `Transaction[]` to `localStorage` key `"transactions"`

### `ScenarioStorage.ts`

- `loadScenarios()` / `saveScenarios()` — read/write `Scenario[]` to `localStorage` key `"scenarios"`
- `loadActiveScenarioId()` / `saveActiveScenarioId()` — read/write active scenario ID to key `"activeScenarioId"`
- All functions include SSR guards (`typeof window === "undefined"`) and try/catch for JSON parsing

### `RecurringTransactionStorage.ts`

- `loadRecurringTransactions()` / `saveRecurringTransactions()` — read/write `RecurringTransaction[]` to `localStorage` key `"recurringTransactions"`

## Computation

### `computeBalance.ts`

- `computeBalance(accountId, transactions)` — filters transactions by account, sums amounts. Returns a single number.

### `computeNetWorthSeries.ts`

- `computeNetWorthSeries(accounts, transactions, period, today?)` — generates `NetWorthDataPoint[]` for the chart
- Generates date points based on `ChartPeriod` (week=daily, month=daily, quarter=weekly, year=monthly)
- Walks through sorted transactions in a single pass, accumulating net worth
- Assets add to net worth, liabilities subtract
- `today` parameter defaults to current date, but is injectable for testing

### `computeProjectedSeries.ts`

- `computeProjectedSeries(accounts, transactions, period, today?, customRange?, recurringTransactions?)` — generates projected future `NetWorthDataPoint[]`
- Computes current net worth from past transactions, then accumulates future transactions and recurring occurrences

### `accumulateNetWorth.ts`

- `accumulateNetWorth(datePoints, sortedTransactions, accountTypes, initialNetWorth?)` — shared accumulation loop used by both `computeNetWorthSeries` and `computeProjectedSeries`

### `generateOccurrences.ts` / `getNextOccurrence.ts`

- Generate projected transaction instances from recurring transactions
- Both use shared utilities: `iterateOccurrenceDates` (generator for date stepping) and `createProjectedTransaction` (builds Transaction from RecurringTransaction + date)

### `buildDisplayTransactions.ts`

- `buildDisplayTransactions(transactions, recurringTransactions, accountId, accountName, activeScenarioId, scenarios, today)` — pure data transformation for `TransactionList`
- Returns `DisplayTransactionData[]` (everything except `editAction` JSX)
- Handles filtering by account, scenario filtering, recurring occurrence lookup, and sorting

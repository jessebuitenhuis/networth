# Services

Pure business logic and storage. No React, no UI. All functions are stateless and testable in isolation.

## Storage

### `AccountStorage.ts`

- `loadAccounts()` / `saveAccounts()` — read/write `Account[]` to `localStorage` key `"accounts"`
- `migrateAccountBalances()` — one-time migration from legacy format where accounts had inline `balance` field. Converts balances to opening-balance transactions. Only runs when `"transactions"` key doesn't exist in localStorage yet.

### `TransactionStorage.ts`

- `loadTransactions()` / `saveTransactions()` — read/write `Transaction[]` to `localStorage` key `"transactions"`

## Computation

### `computeBalance.ts`

- `computeBalance(accountId, transactions)` — filters transactions by account, sums amounts. Returns a single number.

### `computeNetWorthSeries.ts`

- `computeNetWorthSeries(accounts, transactions, period, today?)` — generates `NetWorthDataPoint[]` for the chart
- Generates date points based on `ChartPeriod` (week=daily, month=daily, quarter=weekly, year=monthly)
- Walks through sorted transactions in a single pass, accumulating net worth
- Assets add to net worth, liabilities subtract
- `today` parameter defaults to current date, but is injectable for testing

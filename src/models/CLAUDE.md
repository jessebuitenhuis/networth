# Models

Pure TypeScript types and enums representing the domain. No logic, no imports from other layers.

## Files

- **`Account.ts`** — `Account` type: `{ id, name, type: AccountType }`
- **`AccountType.ts`** — `AccountType` enum: `Asset | Liability`. Assets add to net worth, liabilities subtract.
- **`Transaction.ts`** — `Transaction` type: `{ id, accountId, amount, date (YYYY-MM-DD string), description }`
- **`ChartPeriod.ts`** — `ChartPeriod` enum: `Week | Month | Quarter | Year`. Controls the time range of the net worth chart.
- **`NetWorthDataPoint.ts`** — `NetWorthDataPoint` type: `{ date, netWorth }`. Used as chart data series.

## Conventions

- Dates are ISO `YYYY-MM-DD` strings (not `Date` objects)
- IDs are UUID strings generated via `generateId()` from `src/lib/generateId.ts`
- Amounts are plain numbers (positive = inflow, negative = outflow)
- Net worth = sum of asset balances minus sum of liability balances

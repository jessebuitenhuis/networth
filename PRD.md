# Net Worth Tracker — Product Requirements Document

## Summary

A single-user personal finance app that replaces spreadsheet-based net worth tracking and financial planning. Users manage multiple financial accounts, record transactions manually, and project their future net worth using recurring planned transactions. The app supports multiple planning scenarios (e.g. optimistic vs. conservative) so users can compare different financial futures. An interactive chart visualizes net worth over time with toggleable account visibility. Data is stored locally with an abstracted storage layer to allow future migration to a server-backed solution.

## Key Features

- **Account management** — Create and manage any number of financial accounts (checking, savings, investments, mortgage, etc.)
- **Manual transactions** — Record actual transactions against accounts
- **Future projections** — Enter expected future transactions (one-off or recurring) to forecast net worth
- **Multiple scenarios** — Create and compare different financial plans side by side
- **Net worth chart** — Interactive time-series chart with per-account toggle to show/hide individual accounts
- **Local-first storage** — Data persists in the browser, with a storage abstraction layer for future backends

## User Stories

1. As a user, I want to create financial accounts, so I can represent all the places where I hold money or debt.
2. As a user, I want to edit and delete accounts, so I can keep my account list accurate over time.
3. As a user, I want to record transactions against an account, so I can track actual money moving in and out.
4. As a user, I want to see each account's current balance (derived from transactions), so I know where I stand today.
5. As a user, I want to see my total net worth (sum of all account balances), so I have a single number representing my financial position.
6. As a user, I want to add projected future transactions to an account, so I can plan for expected income and expenses.
7. As a user, I want to create recurring transactions (actual or projected), so I don't have to manually enter repeating entries like salary or mortgage payments.
8. As a user, I want to view a chart of my net worth over time, so I can see how my finances have changed and will change.
9. As a user, I want to toggle individual accounts on and off in the chart, so I can focus on specific accounts or groups.
10. As a user, I want to create multiple planning scenarios, so I can compare optimistic, conservative, and other financial outcomes.
11. As a user, I want to duplicate a scenario, so I can use an existing plan as a starting point for a variation.
12. As a user, I want to see multiple scenarios overlaid on the same chart, so I can visually compare different futures.
13. As a user, I want to edit and delete scenarios, so I can refine or remove plans that are no longer relevant.
14. As a user, I want my data to persist in the browser, so I don't lose my accounts and transactions when I close the tab.
15. As a user, I want to edit or delete a transaction, so I can correct mistakes or remove entries that are no longer relevant.
16. As a user, I want to see a list of transactions for a given account, so I can review its history and upcoming projections.

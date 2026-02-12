# Net Worth Tracker — Product Requirements Document

## Summary

A single-user personal finance app that replaces spreadsheet-based net worth tracking and financial planning. Users manage multiple financial accounts, record transactions manually, and project their future net worth using recurring planned transactions. The app supports multiple planning scenarios (e.g. optimistic vs. conservative) so users can compare different financial futures. An interactive chart visualizes net worth over time with toggleable account visibility. Data is stored locally with an abstracted storage layer to allow future migration to a server-backed solution.

## Key Features

- **Account management** — Create and manage any number of financial accounts (checking, savings, investments, mortgage, etc.)
- **Manual transactions** — Record actual transactions against accounts with locale-aware currency formatting
- **Future projections** — Enter expected future transactions (one-off or recurring) to forecast net worth
- **Multiple scenarios** — Create, compare, and overlay different financial plans side by side
- **Net worth chart** — Interactive time-series chart with per-account toggle, flexible period selection, and scenario comparison
- **Local-first storage** — Data persists in the browser, with a storage abstraction layer for future backends

## User Stories

### Account Management

| ID | User Story | Status |
|----|-----------|--------|
| 1 | As a user, I want to create financial accounts so I can represent all the places where I hold money or debt. The form should have a descriptive "Add Account" button and suppress password manager popups on the name field. | Done |
| 2 | As a user, I want to edit and delete accounts so I can keep my account list accurate over time. Deleting an account should show a confirmation with a red destructive button, and the confirmation should not stack on top of the edit dialog. | Done |

### Transactions

| ID | User Story | Status |
|----|-----------|--------|
| 3 | As a user, I want to record transactions against an account so I can track actual money moving in and out. The amount input should format values as locale-aware currency (e.g. `1.000.000,00` or `1,000,000.00`) using `Intl.NumberFormat`, restrict to 2 decimal places, and provide a +/− toggle button to switch between positive and negative amounts instead of typing a minus sign. | Done |
| 4 | As a user, I want to see each account's current balance (derived from transactions) so I know where I stand today. | Done |
| 5 | As a user, I want to see my total net worth (sum of all account balances) so I have a single number representing my financial position. | Done |
| 6 | As a user, I want to add projected future transactions to an account so I can plan for expected income and expenses. | Done |
| 7 | As a user, I want to create recurring transactions (actual or projected) so I don't have to manually enter repeating entries like salary or mortgage payments. | Done |
| 8 | As a user, I want to edit or delete a transaction so I can correct mistakes or remove entries that are no longer relevant. Deleting should show a confirmation with a red destructive button, and the confirmation should not stack on top of the edit dialog. | Done |
| 9 | As a user, I want to see a list of transactions for a given account so I can review its history and upcoming projections. Transactions belonging to a scenario should have a clear visual indicator (icon or badge) to distinguish them from baseline transactions. | Partial — transaction list works, but no scenario visual indicator |

### Charts & Visualization

| ID | User Story | Status |
|----|-----------|--------|
| 10 | As a user, I want to view a chart of my net worth over time so I can see how my finances have changed and will change. The chart should support periods: 1W, MTD, 1M, 3M, YTD, 1Y, All, and Custom. "All" starts at the date of the first transaction (or today if all are in the future). "Custom" reveals a date range picker with start and end date inputs. The period picker belongs to the chart card. | Done |
| 11 | As a user, I want to toggle individual accounts on and off in the chart so I can focus on specific accounts or groups. The legend should be a centered row of clickable items, each with a small colored dot and the account name. Deselected items should have low opacity. | Done |
| 12 | As a user, I want the chart to redraw with a left-to-right animation when the period changes, rather than slowly morphing between states. | Not started |

### Scenarios

| ID | User Story | Status |
|----|-----------|--------|
| 13 | As a user, I want to create multiple planning scenarios so I can compare optimistic, conservative, and other financial outcomes. The scenario dropdown in transaction dialogs should include a "Create new scenario..." option as the last item, so I can create a scenario inline. | Done |
| 14 | As a user, I want to duplicate a scenario so I can use an existing plan as a starting point for a variation. | Done |
| 15 | As a user, I want to see multiple scenarios overlaid on the same chart so I can visually compare different futures. The planning page should have a multi-select picker with checkboxes to select which scenarios to include. Baseline is always shown as a reference line. Each selected scenario renders as a separate line. | Not started |
| 16 | As a user, I want to select "No scenario" (baseline only) on the planning page so I can see my finances without any scenario applied. | Not started |
| 17 | As a user, I want to edit and delete scenarios from the UI so I can refine or remove plans that are no longer relevant. | Not started — context supports it but no UI |

### Scenario Filtering

| ID | User Story | Status |
|----|-----------|--------|
| 18 | As a user, I want to select a scenario on the account detail page (single-select, default: "Baseline only") so I can see baseline transactions plus that scenario's transactions. | Not started |
| 19 | As a user, I want my selected scenario to persist globally so it stays selected when I navigate between pages. | Done — ScenarioContext persists activeScenarioId to localStorage |

### Layout & Navigation

| ID | User Story | Status |
|----|-----------|--------|
| 20 | As a user, I want page titles and primary actions in the top bar so I can quickly access them. On Planning: scenario picker + "New Scenario" button. On account pages: scenario selector. | Partial — Planning page has title and actions in top bar; Dashboard and account pages do not |
| 21 | As a user, I want the sidebar to show the app name "Net Worth" with the close toggle inside the sidebar, floated right. When collapsed, the open toggle stays in the top bar. | Not started |

### Persistence

| ID | User Story | Status |
|----|-----------|--------|
| 22 | As a user, I want my data to persist in the browser so I don't lose my accounts and transactions when I close the tab. | Done |

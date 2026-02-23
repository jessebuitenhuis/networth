# Net Worth Tracker — Product Requirements Document

**Vision:** You deserve a clear view of your financial future.

**Mission:** We help people set meaningful financial goals and see which choices get them there.

You have financial goals but no single place that helps you plan them clearly. We start with where you want to be — then give you the tools to model different paths, track your progress, and plan at your own pace and level of detail.

Detailed epic specifications and implementation notes live in `docs/epics/`.

## Persona

**Mark, 32, software developer**

Financially literate, earns well, interested in personal finance and FIRE as a side hobby — not an obsession. He reads a few finance blogs, has a rough sense of his savings rate, and knows the basics of investing. He's not a finance professional, but he's past the "where does my money go?" stage.

**His financial life:** He has a few investment accounts, a mortgage, some savings. He contributes to retirement monthly, invests in index funds, and has a loose plan to reach financial independence in his mid-40s. He doesn't budget down to the cent — he knows roughly what he spends and focuses on the big levers: income growth, savings rate, investment returns.

**The problem:** His financial picture is scattered. Some numbers live in a spreadsheet he updates sporadically, some in his head, some in his banking app. He has goals — pay off the mortgage early, hit a net worth milestone, maybe go part-time in five years — but he can't see them in one place. He can't easily answer "what if I increase my savings by 500/month?" or "what happens if returns are 6% instead of 8%?" without rebuilding his spreadsheet.

**How he feels:** Not anxious — but not confident either. He knows he's doing OK, but "OK" is vague. He wants to *see* that he's on track. When he thinks about finances, there's a low-grade restlessness: the sense that he should have a clearer picture than he does.

**His rhythm:** He opens a finance tool maybe twice a month. Once to update some numbers, once to look at the trajectory. He doesn't want daily homework. He wants to check in, see the picture, maybe tweak a scenario, and close the app feeling grounded.

**Why competitors don't work:**
- **YNAB** — He tried it. The zero-based budgeting felt like a part-time job. He doesn't need to assign every dollar when he already knows he's saving enough. It's focused on the micro, he needs the macro.
- **Spreadsheets** — He's built a few. They work until they don't — formulas break, it's tedious to maintain, and comparing scenarios means duplicating entire sheets. He wants something that does what his spreadsheet does but better.
- **Empower** — Good for seeing what he has, but it can't answer "what if?" Monte Carlo simulations feel like a black box. And it really wants him to talk to a financial advisor.
- **Monarch** — Closest to what he wants, but the forecasting is shallow and it still leads with transaction categorization. He wants planning first, not tracking first.

## App Hierarchy

The app is organized around two frames: **Planning** (where am I going) and **Tracking** (where am I). Planning comes first — that's the core premise.

### Home `/`

Unified dashboard blending current position and trajectory. Shows:
- Net worth summary with per-account/type breakdown
- Goal progress cards
- Trajectory preview
- Budget summary (future)

### Planning (sidebar section)

Higher-level, forward-looking features — scenarios, goals, budgets.

- **Projections** `/planning` — Scenario chart, comparison table, scenario management (inline), "What if" tweak wizard
- **Goals** `/goals` — Goal management with progress tracking
- **Budget** `/budget` — Envelope budgeting per category per scenario

### Tracking (sidebar section)

Operational, day-to-day financial reality — transactions, accounts, reports.

- **Transactions** `/transactions` — Unified view across all accounts with collapsible "Planned" section for recurring/future transactions
- **Accounts** `/accounts` — Single page listing all accounts, click through to account detail
- **Reports** `/reports` — Spending trends, net worth history, income vs expenses

## Key Features

### Home

- **Net worth summary** — Total net worth with assets and liabilities broken out separately, plus per-account/type breakdown
- **Goal progress** — Cards showing percentage complete and projected achievement date (e.g., "FIRE — 30% complete, 12 years to go")
- **Trajectory preview** — Quick view of projected net worth trajectory under the active scenario
- **Budget summary** — Total budgeted vs total spent for the current month with on-track/over-budget indicator *(planned)*

### Planning

- **Future projections** — Enter expected future transactions (one-off or recurring) to forecast net worth, with automatic compound growth for accounts with expected returns
- **Multiple scenarios** — Create, compare, duplicate, and overlay different financial plans side by side. Scenarios are managed inline on the Projections page
- **"What if" wizard** — Quick scenario tweaks (e.g., "save 500 more per month", "returns drop to 6%") with instant projection updates *(planned)*
- **Scenario comparison** — Side-by-side metrics table showing projected net worth, goal achievement dates, and income vs expenses across scenarios
- **Net worth chart** — Interactive time-series chart with per-account toggle, flexible period selection, scenario comparison, goal lines, and navigation through time
- **Inflation modeling** — Per-scenario inflation rate that automatically adjusts projected expenses over time
- **Financial goals** — Set net worth targets and track progress toward milestones like financial independence, shown as horizontal lines on the projection chart
- **Envelope-style budgeting** — Set monthly spending budgets per category, tied to scenarios. Per-scenario budgets let you compare spending plans *(planned)*

### Tracking

- **Unified transactions** — All transactions across all accounts in one view, with filtering by account, category, date, and description. Collapsible "Planned" section shows recurring and future transactions *(planned)*
- **Account management** — Create and manage financial accounts (checking, savings, investments, mortgage, etc.) with optional expected return rates
- **Manual transactions** — Record transactions with locale-aware currency formatting and +/- toggle
- **Value-based entry** — Enter current account value and let the app calculate the adjustment transaction
- **CSV import** — Import bank statement CSVs with intelligent column mapping and date format detection
- **Recurring transactions** — Weekly, bi-weekly, monthly, quarterly, and yearly recurring transactions to model real-world financial rhythms
- **Transaction categories** — User-defined hierarchical categories (e.g. Housing > Mortgage), managed inline wherever categories are used
- **Reports** — Spending trends, net worth history, income vs expenses over time *(planned)*

### Infrastructure

- **SQLite storage** — Data persists locally in SQLite with an abstraction layer for future PostgreSQL migration

### Future (out of scope for prototyping)

- **Data export** — CSV export of transactions, accounts, balances, and net worth history
- **Bank sync** — Optional Plaid/GoCardless integration to auto-import transactions

## User Stories

### Tracking my finances

| ID  | User Story                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Status  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1   | As a user, I want to create financial accounts so I can represent all the places where I hold money or debt. The form should have a descriptive "Add Account" button, suppress password manager popups on the name field, and make it clear that the opening balance is optional so I don't feel blocked when I don't know the exact balance yet. When the app has no data, a clear call-to-action should guide me to create my first account so I immediately understand how to get started. | Done    |
| 2   | As a user, I want to edit and delete accounts so I can keep my account list accurate over time. Deleting an account should show a confirmation with a red destructive button, and the confirmation should not stack on top of the edit dialog.                                                                                                                                                                                                                                                | Done    |
| 3   | As a user, I want to record transactions against an account so I can track actual money moving in and out. The amount input should format values as locale-aware currency (e.g. `1.000.000,00` or `1,000,000.00`) using `Intl.NumberFormat`, restrict to 2 decimal places, and provide a +/− toggle button to switch between positive and negative amounts instead of typing a minus sign.                                                                                                    | Done    |
| 4   | As a user, I want to edit or delete a transaction so I can correct mistakes or remove entries that are no longer relevant. Deleting should show a confirmation with a red destructive button, and the confirmation should not stack on top of the edit dialog.                                                                                                                                                                                                                                | Done    |
| 5   | As a user, I want to see a list of transactions for a given account so I can review its history and upcoming projections. Transactions belonging to a scenario should have a clear visual indicator (icon or badge) to distinguish them from baseline transactions.                                                                                                                                                                                                                           | Done    |
| 6   | As a user, I want to enter the current value of an account and have the app calculate the adjustment transaction for me, so I don't have to do mental math when reconciling account balances from statements.                                                                                                                                                                                                                                                                                 | Done    |
| 7   | As a user, I want to import transactions from a bank statement CSV file, so I can quickly catch up on transaction history instead of entering each transaction by hand. The import should intelligently map CSV columns to transaction fields and detect date formats, so common bank exports work with minimal manual configuration.                                                                                                                                                          | Done |
| 28  | As a user, I want to assign categories to transactions and recurring transactions so I can organize my finances by type. Categories should be user-defined and hierarchical (e.g. Housing > Mortgage, Housing > Maintenance, Income > Salary), so I can create a taxonomy that matches my personal financial structure.                                                                                                                                                                       | Done    |
| 43  | As a user, I want to add a transaction directly from the dashboard (with an account selector), so I can quickly record transactions without navigating to a specific account first.                                                                                                                                                                                                                                                                                                          | Done    |
| 44  | As a user, I want the transaction list to adapt its columns to context — hiding the account column when viewing a single account — so I only see relevant information.                                                                                                                                                                                                                                                                                                                       | Done    |
| 45  | As a user, I want to manage my category hierarchy through direct manipulation — drag to reparent, inline creation of subcategories — so organizing categories feels fast and intuitive.                                                                                                                                                                                                                                                                                                      | Done    |
| 29  | As a user, I want to search and filter transactions within an account so I can quickly find specific entries. I should be able to filter by description text, date range, amount, and category.                                                                                                                                                                                                                                                                                              | Done    |

### Planning my future

| ID  | User Story                                                                                                                                                                                                                                                                          | Status  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 8   | As a user, I want to add projected future transactions to an account so I can plan for expected income and expenses.                                                                                                                                                                | Done    |
| 9   | As a user, I want to create recurring transactions (actual or projected) so I don't have to manually enter repeating entries like salary or mortgage payments.                                                                                                                      | Done    |
| 10  | As a user, I want to set an expected annual return percentage on an investment account (e.g., 8% on an ETF), so the app automatically projects compound growth in the planning chart without me having to create manual recurring transactions.                                     | Done    |
| 11  | As a user, I want to create multiple planning scenarios so I can compare optimistic, conservative, and other financial outcomes. The scenario dropdown in transaction dialogs should include a "Create new scenario..." option as the last item, so I can create a scenario inline. | Done    |
| 12  | As a user, I want to duplicate a scenario so I can use an existing plan as a starting point for a variation.                                                                                                                                                                        | Done    |
| 13  | As a user, I want to edit and delete scenarios from the UI so I can refine or remove plans that are no longer relevant.                                                                                                                                                             | Done    |
| 14  | As a user, I want my selected scenario to persist globally so it stays selected when I navigate between pages.                                                                                                                                                                      | Done    |
| 30  | As a user, I want to see a timeline of my recurring transactions — grouped and labeled by category — so I can understand how my income and expenses shift at major life milestones like starting a pension, paying off a mortgage, or changing jobs.                                 | Planned |
| 35  | As a user, I want to create recurring transactions with weekly, bi-weekly, and quarterly frequencies (in addition to monthly and yearly), so I can accurately model real-world financial rhythms like bi-weekly paychecks or quarterly tax payments.                                   | Done    |
| 36  | As a user, I want to apply an inflation rate to a scenario, so my projected expenses grow over time and my future net worth projections are more realistic.                                                                                                                          | Done    |

### Seeing my progress

| ID  | User Story                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Status  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 15  | As a user, I want to see each account's current balance and my total net worth so I know where I stand today.                                                                                                                                                                                                                                                                                                                                                                                                             | Done    |
| 16  | As a user, I want to view a chart of my net worth over time so I can see how my finances have changed and will change. The chart should support periods: 1W, MTD, 1M, 3M, YTD, 1Y, All, and Custom. "All" starts at the date of the first transaction (or today if all are in the future). "Custom" reveals a date range picker with start and end date inputs. The period picker belongs to the chart card. Accounts should show a balance of 0 before their first transaction date to accurately reflect their history. The chart should always show a zero line, use rounded Y-axis values, and handle negative amounts with a centered zero line. | Done |
| 17  | As a user, I want to toggle individual accounts on and off in the chart so I can focus on specific accounts or groups. The legend should be a centered row of clickable items, each with a small colored dot and the account name. Deselected items should have low opacity.                                                                                                                                                                                                                                              | Done    |
| 18  | As a user, I want the chart to redraw with a left-to-right animation when the period changes, rather than slowly morphing between states.                                                                                                                                                                                                                                                                                                                                                                                 | Done    |
| 19  | As a user, I want to see multiple scenarios overlaid on the same chart so I can visually compare different futures. The planning page should have a multi-select picker with checkboxes to select which scenarios to include. Baseline is always shown as a reference line. Each selected scenario renders as a separate line.                                                                                                                                                                                            | Done    |
| 20  | As a user, I want to select "No scenario" (baseline only) on the planning page so I can see my finances without any scenario applied.                                                                                                                                                                                                                                                                                                                                                                                     | Done    |
| 21  | As a user, I want to select a scenario on the account detail page (single-select, default: "Baseline only") so I can see baseline transactions plus that scenario's transactions.                                                                                                                                                                                                                                                                                                                                         | Done    |
| 22  | As a user, I want to see the total net worth next to "Accounts" in the sidebar and each account's balance next to its name (in abbreviated format like "100K"), so I can get a quick financial overview without navigating into each account. The "New Account" action should become a muted link at the bottom of the account list to make room.                                                                                                                                                                         | Done    |
| 31  | As a user, I want to see my total assets and total liabilities broken out separately on the dashboard alongside my net worth, so I understand my financial position at a glance rather than a single combined number.                                                                                                                                                                                                                                                                                                    | Done    |
| 37  | As a user, I want to see a scenario comparison summary that shows key metrics side by side (projected net worth at 1yr, 5yr, 10yr; goal achievement dates; total income vs expenses), so I can compare scenarios with numbers, not just chart lines.                                                                                                                                                                                                                                                                    | Done    |
| 46  | As a user, I want to navigate forward and backward through time on the planning chart, and see actual history leading into projections, so I can see how my real finances connect to my planned future.                                                                                                                                                                                                                                                                                                                 | Done    |
| 47  | As a user, I want scenario and account pickers hidden when they serve no purpose (no scenarios exist, or fewer than 2 accounts), so the interface stays clean and focused.                                                                                                                                                                                                                                                                                                                                              | Done    |

### Financial goals

| ID  | User Story                                                                                                                                                                                                                                                              | Status  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 23  | As a user, I want to set net worth goals (e.g., "Emergency fund: 10K", "FIRE: 500K") so I have clear financial targets to work toward.                                                                                                                                  | Done    |
| 24  | As a user, I want to see my goals as horizontal lines on the planning chart, so I can visually see when different scenarios are projected to reach each goal.                                                                                                           | Done    |
| 25  | As a user, I want to see goal progress on the dashboard as cards showing percentage complete and projected achievement date under the current scenario (e.g., "FIRE — 30% complete, 12 years to go"), so I have a motivating at-a-glance view of my financial progress. | Done    |

### Budgeting

| ID  | User Story                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Status  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 38  | As a user, I want to set monthly spending budgets per category, tied to a scenario, so I can define a spending plan for each scenario I create. Each scenario can have its own budget allocations (e.g. a "frugal" scenario with lower dining budget), and the Baseline scenario gets a default budget. Budgets reset monthly (no carryover), and I see progress bars showing spent vs budgeted per category for the current month.                                                                                                          | Planned |
| 39  | As a user, I want to see a budget summary on the dashboard showing total budgeted vs total spent for the current month under the active scenario, with a quick visual indicator (on track / over budget), so I can assess my financial discipline at a glance.                                                                                                                                                                                                                   | Planned |
| 42  | As a user, I want to view a monthly cash flow breakdown showing income vs expenses by category for any given month, so I can understand where my money is going. This should work for both past months (actual spending) and future months (projected from recurring transactions), helping me connect today's spending patterns with tomorrow's net worth trajectory.                                                                                                           | Planned |

### Data portability

| ID  | User Story                                                                                                                                                                                                                  | Status  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 40  | As a user, I want to export my transactions, account balances, and net worth history as CSV files, so I can back up my data, analyze it in a spreadsheet, or migrate to another tool. This is essential for user trust.     | Future  |
| 41  | As a user, I want to optionally connect my bank accounts to auto-import transactions, so I don't have to enter every transaction by hand. Manual entry should remain the primary workflow; bank sync is a convenience layer. | Future  |

### Storage

| ID  | User Story                                                                                                                                                                                                                                                                                           | Status  |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 26  | As a user, I want my data stored in a SQLite database so I don't lose my accounts and transactions when clearing browser data. The storage layer should be abstracted so the app can migrate to PostgreSQL for production use later.                                                                 | Done    |
| 27  | As a developer, I want a seed data script (`npm run seed`) that populates the database with realistic sample data (multiple accounts, transactions, recurring transactions, scenarios, and a default category hierarchy), so I can quickly test the app without manual data entry. Each git worktree should have isolated storage. | Done    |

## Technical Backlog

Architectural improvements and refactoring tasks to maintain code quality over time.

| ID  | Description | Status |
| --- | --- | --- |
| T1 | Adopt `DialogFooterActions` across all remaining dialogs (accounts, goals, scenarios, import) for consistent Cancel/Submit button groups | Done |
| T2 | Migrate remaining switch-based sorting/filtering logic to data-driven column definitions (Open/Closed Principle) | Planned |
| T3 | Audit all domain components for SRP violations and split mixed view/create components | Planned |
| T4 | Adopt page object pattern (`*.page.tsx`) for all test files that interact with UI components — eliminate raw `screen.getBy*` + `user.click/type/clear` duplication in tests by routing all interactions through page objects | Planned |

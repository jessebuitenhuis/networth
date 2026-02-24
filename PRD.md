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

Unified dashboard blending current position and trajectory.

### Planning (sidebar section)

Higher-level, forward-looking features — scenarios, goals, budgets.

- **Projections** `/planning`
- **Goals** `/goals`
- **Spending Plan** `/budget`

### Tracking (sidebar section)

Operational, day-to-day financial reality — transactions, accounts, reports.

- **Transactions** `/transactions`
- **Accounts** `/accounts`
- **Reports** `/reports`

## User Stories

### Home

- ~~As a user, I want a quick-start wizard to set up my accounts and assumptions, so I can see my first projection without detailed tracking — and revisit it anytime my situation changes.~~ ✅
- As a user, I want to see my net worth, assets, and liabilities, so I know where I stand at a glance.
- As a user, I want to see goal progress, so I stay motivated toward my financial targets.
- As a user, I want to see my projected net worth trajectory, so I can quickly see where I'm headed.
- As a user, I want to quickly record a transaction, so I can keep my finances up to date with minimal effort.
- As a user, I want to see planned vs actual spending, so I can see if my projections match reality.
- As a user, I want to be notified when I reach a financial milestone, so I feel the progress I'm making.

### Planning — Projections

- As a user, I want to add expected future transactions, so I can forecast my net worth.
- As a user, I want to create recurring transactions, so I don't have to manually enter repeating income and expenses.
- As a user, I want to set an expected return rate on investment accounts, so my projections include compound growth automatically.
- As a user, I want to create multiple planning scenarios, so I can compare different financial outcomes.
- As a user, I want to duplicate a scenario, so I can use an existing plan as a starting point for a variation.
- As a user, I want to apply an inflation rate to a scenario, so my projections account for rising costs over time.
- As a user, I want to see a chart of my net worth over time, so I can visualize how my finances have changed and will change.
- As a user, I want to compare scenarios visually, so I can evaluate different futures at a glance.
- As a user, I want to compare scenarios side by side with key metrics, so I can evaluate plans with numbers, not just visuals.
- As a user, I want to quickly tweak a scenario with "what if" adjustments, so I can instantly see how changes affect my projections.

### Planning — Goals

- As a user, I want to set net worth goals, so I have clear financial targets to work toward.
- As a user, I want to set a financial independence goal based on annual expenses, so I can see when my investments can sustain my lifestyle.
- As a user, I want to see my goals on the projection chart, so I can see when different scenarios are projected to reach each goal.

### Planning — Spending Plan

- As a user, I want to plan expected spending per category, so my projections reflect realistic future expenses.
- As a user, I want to see when a debt (like my mortgage) will be paid off under different scenarios, so I can plan around major financial milestones.

### Tracking — Accounts

- As a user, I want to create and manage financial accounts, so I can represent all the places where I hold money or debt.
- As a user, I want to see each account's balance at a glance, so I get a quick financial overview.

### Tracking — Transactions

- As a user, I want to record transactions against an account, so I can track money moving in and out.
- As a user, I want to enter the current value of an account and have the adjustment calculated for me, so I don't have to do mental math when reconciling balances.
- As a user, I want to import transactions from a bank statement CSV, so I can quickly catch up on transaction history.
- As a user, I want to assign hierarchical categories to transactions, so I can organize my finances by type.
- As a user, I want to search and filter transactions, so I can quickly find specific entries.
- As a user, I want to export my transactions as CSV, so I always have access to my own data.

### Tracking — Reports

- As a user, I want to see my savings rate over time, so I can track the metric that most directly drives my net worth growth.
- As a user, I want to see spending trends and income vs expenses over time, so I can understand my financial patterns.
- As a user, I want to see a monthly cash flow breakdown by category, so I understand where my money is going.

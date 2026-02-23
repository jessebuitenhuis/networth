## Monarch

### Structure

- Dashboard
- Accounts
- Transactions
- Cash Flow
- Reports
- Budget
- Recurring
- Goals
- Investments
- Advice
- Help & support
- User profile

Main sections on marketing site are Tracking, Budgetting, Planning

### Layout

- Navbar on left side, similair to our app
- Topbar with title and main cta(s) on top, similair
- shadcn aesthetic
- Color palette: gray with orange
- Responsive design for mobile with bottom menu (dashboard, accounts, transactions, cash flow, budget)

### Features

- A list of transactions from all accounts
- Icons provide a visual cue for transactions and make it lighter. seems based on categories
- Dashboard uses two column layout on desktop, presenting a lot more information. Looks widget based.
- Budget items show a progress bar, i guess spent vs budgeted
- Multi-user, so you can use it together
- Goals have images and progress bars
- Budgetting screen is a YNAB style envelope system (budget, actual, remaining). Budget can be edited inline
- Budget has sections: Income, Expenses > Fixed, Flexible, Non-Monthly
- Budget uses colors to indicate status (green for within budget, probably yellow or red for over budget)
- Two levels of budgetting - one category based, other based on the sections.

---

## YNAB (You Need A Budget)

### Structure

**Web App (left sidebar):**
- Plan (formerly "Budget") -- the main budgeting workspace
- Reflect -- reports and insights (Spending Breakdown, Spending Trends, Net Worth, Income vs. Expense)
- All Accounts -- combined transaction view
- Individual accounts listed by type (Budget Accounts, Tracking Accounts)

**Mobile App (bottom tab bar, post-Sep 2025 "Great Remodel"):**
- Home -- dashboard/command center
- Plan -- budget categories and assignment
- Spending -- transaction list across all accounts
- Reflect -- reports and insights
- More -- settings, support, privacy

### Layout

- Left sidebar on web with collapsible navigation; contains Plan, Reflect, and a list of all linked accounts grouped by type
- Plan/Budget screen uses a table layout: category groups on the left, with three data columns -- Assigned, Activity, Available
- Right-side inspector panel (~33% width) shows totals: Total Budgeted, Total Activity, Total Available, Total Inflows, plus per-category notes
- "Ready to Assign" banner at top of Plan screen shows unallocated dollars
- Three themes: Default (clean, neutral tones), Classic (Caribbean blue), Dark Mode
- Color palette: blue/purple primary ("Blurple"), cream/off-white backgrounds, dark navy text. Semantic colors: green for funded, orange for underfunded, red for overspent
- Separate native mobile apps for iOS and Android (not responsive web); web app is desktop-focused
- Mobile app uses bottom tab bar navigation (Home, Plan, Spending, Reflect, More)
- Clean, minimalist interface that prioritizes functionality over decoration

### Features

- **Zero-based / envelope budgeting**: Every dollar gets assigned a job. Categories act as digital envelopes. Plan screen lets you assign income to categories and track Assigned, Activity, and Available
- **Category groups**: Expandable/collapsible master category groups with subcategories. Groups can be customized freely
- **Targets**: Spending or savings targets per category -- weekly, monthly, yearly, or custom cadence. Visual progress bars show funding status with color-coded indicators
- **Auto-Assign**: One-click assignment of money to underfunded categories based on target priority and due dates
- **Cost to Be Me**: Shows total monthly cost of all targets -- a single number representing how much income you need (mobile only)
- **Age of Money**: Metric showing average days between earning and spending money. Encourages building a buffer
- **Focused Views**: Custom filtered views of your budget showing only selected categories
- **Transaction management**: Account register with Date, Payee, Category, Memo, Amount, Cleared/Reconciled. Split transactions supported. Inline editing
- **Bank sync**: Automatic transaction import from linked accounts. Manual entry also supported
- **Reports (Reflect tab)**: Spending Breakdown (donut chart), Spending Trends (bar graph over time), Net Worth (line chart assets vs debts), Income vs. Expense (bar graph)
- **Loan Planner**: Payoff simulator showing interest and time savings from extra payments. Snowball and avalanche methods (web only)
- **YNAB Together**: Subscription sharing for up to 6 people with shared or private budgets
- **Four Rules philosophy**: (1) Give Every Dollar a Job, (2) Embrace Your True Expenses, (3) Roll With the Punches, (4) Age Your Money
- **Pricing**: $14.99/month or $109/year, 34-day free trial

---

## Simplifi by Quicken

### Structure

- Dashboard (customizable home with up to 11 tile cards)
- Transactions (unified list across all connected accounts)
- Spending Plan (top-down budget: income minus bills minus goals = available to spend)
- Savings Goals (target-based savings tracking)
- Bills & Income (upcoming bills, subscriptions, income with calendar view)
- Watchlists (mini-budgets for specific spending areas)
- Reports (spending, income, net income, savings, investments, net worth, credit score, taxes, monthly summary)
- Planning (retirement planner with scenario modeling)
- Investments (holdings and performance tracking)

### Layout

- Sidebar navigation on the left with icon-only collapsed state; labels appear on hover
- Originally blue color scheme; rebranded to purple/violet palette after Quicken unification
- Clean, card-based dashboard layout with drag-and-drop reordering and show/hide toggles per card
- Web app and native mobile apps (iOS/Android) plus Progressive Web App (PWA) for ChromeOS
- Separate dashboard layout customization for web vs. mobile
- Minimal, modern aesthetic aimed at millennials
- White/light background with colored accent elements (purple primary, teal/green for positive indicators)

### Features

- **Spending Plan**: Not a traditional budget -- uses top-down formula: Income - Bills & Subscriptions - Planned Spending - Savings Goals = "Available to Spend." Shows real-time "left this month" broken down to per-day average
- **Account syncing**: Connects to 14,000+ financial institutions; also supports manual accounts for real estate, vehicles
- **Transaction management**: Auto-categorization; categories up to 3 levels deep, tags for cross-category grouping, payee renaming
- **Transaction rules**: Automated "if/then" rules (e.g., if payee matches X, set category to Y, add tag Z)
- **Recurring transactions**: Auto-detected from connected accounts; Bills & Income section shows calendar view with upcoming items
- **Bill Connect**: Connects directly to billers to pull actual bill amounts before they are charged
- **Watchlists**: Mini-budgets to monitor spending by category, payee, or tag; shows monthly spend, YTD, projection, and average
- **Savings Goals**: Target amount and timeline; calculates required monthly contributions; contributions auto-integrate into the Spending Plan
- **Reports**: 9 report types filterable by payee, category, tag, date range; save custom report configurations
- **Net worth tracking**: Historical net worth chart based on account balances over time
- **Investment tracking**: Portfolio holdings and performance; individual transaction management
- **Retirement Planner**: Project savings up to 35 years; model scenarios by adjusting retirement age, contributions, returns, expenses
- **Credit score**: VantageScore 3.0 via Equifax; updated monthly
- **Kelley Blue Book integration**: Automatic vehicle valuation updates every 30 days feeding into net worth
- **Pricing**: ~$3-4/month billed annually

---

## Mint (Intuit) -- Discontinued January 2024

### Structure

- Overview (dashboard)
- Transactions
- Bills
- Budgets
- Goals
- Trends (reports)
- Investments
- Ways to Save (marketplace)
- Accounts

### Layout

- Web-first design with mobile app companion
- Desktop: horizontal top navigation bar with tabs for each major section
- Mobile: bottom navigation bar for core sections; hamburger menu for additional areas
- Dashboard shows summary of account balances, recent transactions, budget progress, upcoming bills, alerts
- Color palette: mint green primary, white backgrounds, dark gray text; circular leaf logo
- Cards and panels used to separate sections on the dashboard
- Data-dense but organized -- tables, bar charts, progress indicators

### Features

- **Account Aggregation**: 17,000+ financial institutions linked into a single view
- **Automatic Transaction Categorization**: Auto-categorized with ability to recategorize and create custom subcategories
- **Budgets**: Spending limits per category; visual progress bars; alerts when approaching/exceeding limits
- **Goals**: Short-term and long-term savings goals tied to specific accounts; suggested monthly savings
- **Bill Tracking**: All bills in one place with reminders and low-balance warnings
- **Net Worth Tracking**: Assets minus liabilities with historical chart
- **Trends/Reports**: Spending, income, net income, assets, debts, net worth with date range filtering
- **Investment Tracking**: Portfolio value, performance, asset allocation, market index comparison
- **Subscription Monitoring**: Highlighted recurring charges with price increase alerts
- **Credit Score**: Free via TransUnion
- **Free**: Monetized through targeted financial product recommendations

---

## Credit Karma (Intuit) -- Post-Mint Merger

### Structure

- **Web top navigation**: Credit Cards, Personal Loans, Auto, Home, Money, Credit Scores, Resources
- **Mobile bottom navigation**: Credit Cards, Loans, Insurance, Credit Karma Money
- **Dashboard tabs**: Net Worth, Credit, Debt, Loans
- Intuit Assist (AI assistant) accessible throughout the app

### Layout

- Mobile-first design; also has full web experience
- Web: fixed horizontal top navigation with mega-menu dropdowns
- Mobile: bottom navigation bar; home screen is a vertically scrollable dashboard
- Dashboard is personalized per user -- sections shown/hidden based on financial profile
- Net worth section pinned to top of dashboard
- Color palette: "Karma Green" primary, white backgrounds, blue accent for CTAs, dark text
- Card-based layout with icon-driven navigation categories
- Seven icon-based categories on homepage: Credit, Cards, Loans, Home, Auto, Insurance, Money
- Design adapts content and recommendations to user segment

### Features

- **Credit Score Monitoring**: Free scores from TransUnion and Equifax with change alerts and improvement tips
- **Credit Report Access**: Full reports from two bureaus with proactive analysis
- **Credit Score Simulator**: Model how actions (e.g., paying down balances) affect scores
- **Net Worth Tracking**: Aggregated view across linked accounts (carried over from Mint)
- **Spending Tracker**: Monthly spending by categories; comparison to previous month (no custom categories)
- **Cash Flow Monitoring**: Transaction visibility with alerts when approaching cash crunch
- **Credit Karma Money Spend**: Free checking -- no fees, early direct deposit, overdraft coverage up to $200, 55,000+ fee-free ATMs
- **Credit Karma Money Save**: High-yield savings, FDIC-insured up to $5M through partner bank network
- **Financial Product Marketplace**: Personalized credit card, loan, mortgage, insurance recommendations with approval odds
- **Identity Monitoring**: Free ID theft monitoring and data breach alerts
- **Intuit Assist (AI)**: Generative AI financial assistant for personalized insights
- **Credit Builder / Credit Spark**: Build credit via rent and utility payment reporting
- **Free**: Monetized through financial product referrals

### What Carried Over from Mint
- Net worth tracking, spending/transaction monitoring, cash flow visibility, account linking

### What Was Lost from Mint
- Custom budgets with spending limits per category, savings goals, custom transaction categories, investment portfolio tracking, subscription monitoring, detailed trend reports, bill reminder scheduling

---

## Copilot Money

### Structure

- Dashboard (home tab)
- Transactions
- Investments
- Accounts
- Categories
- Recurrings
- Goals
- Cash Flow

### Layout

- Bottom tab navigation on iOS; sidebar navigation on web/iPad/Mac
- Dashboard features spending progress chart at top showing "Free to Spend" with dotted ideal-rate line and solid actual-spending line
- Below chart: "To Review" section, "Budgets" snapshot, "Upcoming" recurrings (horizontally scrollable), "Net This Month" income/spending comparison
- Tab ordering is customizable
- Fully native iOS/iPadOS/macOS design; web app released early 2026
- Dark mode and light mode supported
- Color palette: blue primary accent; dynamic dashboard line colors -- green (under budget), light orange (slightly over), dark orange (>20% over), red (exceeded)
- Over 30 common components and 50+ custom icons across two color themes
- Accessible color option for red-green colorblind users
- Smooth animations give a premium feel

### Features

- **AI categorization**: Per-user private ML model that predicts categories based on past behavior and improves over time
- **Bank syncing**: 10,000+ institutions via Plaid; Apple FinanceKit integration for Apple Card/Savings in real-time
- **Adaptive budgets**: Learn from spending habits and auto-adjust
- **Savings Goals**: Track progress toward specific targets
- **Cash Flow**: Income, spending, and net income over the past year with dedicated graph
- **Investment tracking**: Unified view across all brokerage accounts
- **Recurring transaction detection**: Upcoming bill timeline
- **Batch review**: Review newly imported transactions in bulk
- **Tags**: Cross-category transaction organization
- **Multi-platform**: iPhone, iPad, Mac, and web for a single subscription
- **Pricing**: ~$12/month or $95/year (no free tier)

---

## Empower (formerly Personal Capital)

### Structure

- Dashboard (home/overview with widget cards)
- Net Worth
- Budgeting (via Transactions menu)
- Cash Flow
- Investing / Portfolio
- Investment Checkup
- Retirement Planner
- Savings Planner / Emergency Fund
- Accounts panel (sidebar showing linked accounts by type)

### Layout

- Web-first dashboard with left-side accounts panel grouping accounts by type (Cash, Investment, Credit, Loan, Mortgage, Other Asset, Other Liabilities)
- Main content area shows modular widget cards: Net Worth chart, Cash Flow summary, Portfolio Balance, Budgeting progress, Retirement Savings meter, Emergency Fund bar graph
- Color palette: blues as primary, green for positive indicators, white/light backgrounds
- Investment allocation shown as colored pie/donut chart; each segment selectable for drill-down
- Cash Flow page features bar charts for income vs. expenses
- Clean, professional, data-dense design aimed at investors and wealth-builders
- Mobile apps exist but web version is primary

### Features

- **Completely free** dashboard (monetized through optional wealth management advisory at 0.89%+ AUM)
- **Net worth tracking**: Automatic updates across all linked accounts, historical chart, asset breakdown pie chart
- **Investment Checkup**: Analyzes portfolio allocation, compares to recommended "Smart Weighting," identifies risk exposure
- **Retirement Planner**: Monte Carlo simulation-based projections, adjustable assumptions
- **Retirement Fee Analyzer**: Identifies hidden fees in 401(k)s and investment accounts, shows long-term impact
- **Cash flow tracking**: 30-day income/expense breakdown at transaction level
- **Budgeting**: Automatic categorization (Income, Spending, Bills) with month-over-month comparison
- **Emergency Fund tracker**: 12-month bar graph comparing actual cash vs. target
- **Real estate tracking**: Via Zillow estimates
- **Links to 14,000+ financial institutions**
- **3M+ users**: Most complete free net worth tracker available

---

## Lunch Money

### Structure

- Overview (home dashboard with period picker)
- Transactions
- Budget
- Recurring Items
- Net Worth
- Accounts
- Analyze / Stats / Trends
- Tags
- Categories
- Rules (auto-categorization)
- Crypto
- Settings (Collaborators, Multicurrency, Billing, Developer API)

### Layout

- Web-first design (desktop is primary); mobile companion apps with more limited functionality
- Left sidebar navigation with all sections listed
- Overview page: period picker (top-left), Accounts Overview card, Period Summary card (income, expenses, net income, savings rate), Spending Breakdown card (bar charts, budget comparison)
- Clean, minimalist aesthetic with ample whitespace -- "delightfully simple" branding
- Category budget progress bars color-coded: green, yellow, red
- Muted blues, grays, whites as primary; subtle accent colors for categories
- Built by solo founder Jen Yip (ex-Twitter engineer), now with small team

### Features

- **Flexible transactions**: Split, group, tag, categorize with custom rules
- **Category groups**: Nested/subcategories with granular control (treat as income, exclude from budget, exclude from spending)
- **Color-coded tags**: Cross-category tagging for deeper insights
- **Multi-currency**: 160+ global currencies with automatic conversion
- **Cryptocurrency tracking**: Syncs with Coinbase, Kraken, Ethereum wallets
- **Bank syncing**: Plaid (US, Canada, expanding Europe); CSV import, manual entry, or developer API
- **Net Worth**: Historical trend chart
- **Developer API**: Custom integrations and automations (major differentiator for technical users)
- **Auto-categorization rules**: Based on merchant name, amount, or other criteria
- **Collaborator support**: Invite partners/family with their own login
- **Open development**: Public changelog and community feedback
- **Pricing**: $10/month or "pick your price" annual plan starting at $50/year

---

## Kubera

### Structure

- Dashboard (net worth overview with portfolio summary)
- Sheets (customizable, spreadsheet-style portfolio pages)
- Recap (historical performance, allocation changes, net worth impact)
- Fast Forward (future net worth projection tool)

### Layout

- Web-based only (no native mobile apps; mobile browser access)
- Spreadsheet-like interface: users add, rename, rearrange sheets with custom sections
- Dashboard displays net worth prominently alongside portfolio holdings
- Clean, minimal, data-focused design; resembles a well-organized auto-updating spreadsheet
- Light/professional color scheme; white backgrounds with clear data hierarchy
- Customizable: notes, attached documents, naming conventions, sub-sheets

### Features

- **Positioned for high-net-worth individuals**
- **Aggregates all asset classes**: Bank accounts, brokerages, crypto/DeFi/NFTs, real estate (Zillow), vehicles (VIN lookup), domains, private equity, collectibles, art
- **Real-time data**: Connects to bank and brokerage accounts for automatic balance updates
- **Nested portfolios**: Map complex ownership structures -- trusts, LLCs, family entities
- **AI import**: CSV, PDF, and screenshot import of financial data
- **Fast Forward**: Projects how scenarios (inflation, market changes) affect future net worth
- **No budgeting, no transaction categorization** -- purely wealth tracking and visualization
- **White-label version** available for financial advisors
- **Pricing**: Essentials $249/year; Black $2,499/year (nested portfolios, concierge support)

---

## PocketSmith

### Structure

- Dashboard (customizable with widget cards)
- Transactions
- Calendar (budget events + forecast graph -- unique differentiator)
- Budget
- Reports: Income & Expense, Cashflows, Net Worth, Trends, Digest, Timeline
- Manage: Bank Feeds, Categories, Account Summary, Category Rules, Saved Searches, Filters

### Layout

- Top navigation bar with four primary items (Dashboard, Transactions, Calendar, Budget) prominently placed
- Reports and Manage grouped into dropdown menus
- Dashboard is fully customizable with extensive widget library (net worth graph with actual/forecast layers, spending, budget summary, etc.)
- Calendar view is key differentiator: budget events on daily calendar with forecast graph at top and draggable time slider
- Color-coded: green (positive), red (negative), black (neutral); blue flags for forecast markers
- Web-first design with mobile companion apps (iOS/Android)
- Clean, functional aesthetic focused on data density and customization

### Features

- **Cash flow forecasting up to 30 years** (unique differentiator): projects daily account balances based on recurring events and budgets
- **What-if scenario planning**: Test financial decisions before committing
- **Calendar-based budgeting**: Schedule income and expenses on specific dates, see how they affect future balances
- **Bank feeds**: 12,000+ global institutions with strong international support (New Zealand-based)
- **Multi-currency support**
- **Customizable dashboard**: Drag-and-drop widget system
- **Net Worth report**: Assets vs. liabilities with actual and forecast overlays
- **Category rules**: Automatic transaction categorization
- **Saved searches and filters**: Complex transaction queries
- **Collaborative access**: Invite advisors or family members
- **Pricing**: Free (limited), Premium $12.50/month (10-year forecasting), Super $22/month (30-year forecasting, unlimited bank feeds)

---

## Rocket Money (formerly Truebill)

### Structure

- Home / Dashboard
- Spending
- Recurring / Subscriptions
- Bills
- Budgets
- Savings Goals
- Net Worth (Premium only)
- Credit Score / Credit Report (Premium only)
- Accounts

### Layout

- Mobile-first design with bottom navigation bar on iOS/Android
- Home dashboard shows balances, recent transactions, upcoming bills with colorful graphs
- "Net Cash" widget in dashboard shows total available money
- Spending tab highlights monthly spending, income, bill count, remaining discretionary budget
- Recurring section presents subscriptions on a timeline for cash flow planning
- Clean, colorful, consumer-friendly interface -- more approachable than data-dense competitors
- Web app available for Premium users
- iOS widgets for quick balance/spending checks

### Features

- **Subscription detection and cancellation concierge**: Identifies recurring charges; can negotiate or cancel subscriptions on your behalf (signature feature)
- **Bill negotiation service**: Negotiates lower rates on cable, internet, phone (takes percentage of savings)
- **Smart Savings**: Automated savings transfers
- **Budget creation**: Spending category tracking
- **Net worth tracking** (Premium): Assets and liabilities with historical view
- **Credit monitoring** (Premium): Full credit report via Experian (FICO 2)
- **Account balance alerts**: Low-balance notifications
- **Account sharing** (Premium): Partner/family access
- **Backed by Rocket Companies** (Rocket Mortgage parent)
- **Pricing**: Freemium -- core subscription tracking free; Premium "pay what you think is fair" starting at $6-12/month

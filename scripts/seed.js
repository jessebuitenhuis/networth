/* eslint-disable @typescript-eslint/no-require-imports */
const Database = require("better-sqlite3");
const { mkdirSync } = require("fs");
const { dirname } = require("path");
const { randomUUID } = require("crypto");

const PLACEHOLDER_USER_ID = "placeholder-user-id";

// ---------------------------------------------------------------------------
// Database connection (mirrors src/db/connection.ts)
// ---------------------------------------------------------------------------
const dbPath =
  process.env.DATABASE_PATH || `${process.cwd()}/data/networth.db`;
mkdirSync(dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    expected_return_rate REAL
  );
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    account_id TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    description TEXT NOT NULL,
    is_projected INTEGER,
    scenario_id TEXT
  );
  CREATE TABLE IF NOT EXISTS recurring_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    account_id TEXT NOT NULL,
    amount REAL NOT NULL,
    description TEXT NOT NULL,
    frequency TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    scenario_id TEXT
  );
  CREATE TABLE IF NOT EXISTS scenarios (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    target_amount REAL NOT NULL
  );
  CREATE TABLE IF NOT EXISTS settings (
    user_id TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT,
    PRIMARY KEY (user_id, key)
  );
`);

// ---------------------------------------------------------------------------
// Clear existing data
// ---------------------------------------------------------------------------
db.exec(`
  DELETE FROM transactions;
  DELETE FROM recurring_transactions;
  DELETE FROM goals;
  DELETE FROM settings;
  DELETE FROM scenarios;
  DELETE FROM accounts;
`);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function pad(n) {
  return String(n).padStart(2, "0");
}

function dateStr(year, month, day) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** Return a new {year, month} shifted by `offset` months from the given date. */
function shiftMonth(year, month, offset) {
  const total = (year - 1) * 12 + (month - 1) + offset;
  return { year: Math.floor(total / 12) + 1, month: (total % 12) + 1 };
}

// ---------------------------------------------------------------------------
// IDs (pre-generated so we can cross-reference)
// ---------------------------------------------------------------------------
const accountIds = {
  checking: randomUUID(),
  savings: randomUUID(),
  sp500: randomUUID(),
  retirement: randomUUID(),
  mortgage: randomUUID(),
  creditCard: randomUUID(),
};

const scenarioIds = {
  basePlan: randomUUID(),
  aggressive: randomUUID(),
};

const goalIds = {
  emergency: randomUUID(),
  downPayment: randomUUID(),
  fire: randomUUID(),
};

// ---------------------------------------------------------------------------
// 1. Accounts
// ---------------------------------------------------------------------------
const accountRows = [
  {
    id: accountIds.checking,
    name: "Checking Account",
    type: "Asset",
    expected_return_rate: null,
  },
  {
    id: accountIds.savings,
    name: "High-Yield Savings",
    type: "Asset",
    expected_return_rate: null,
  },
  {
    id: accountIds.sp500,
    name: "S&P 500 ETF",
    type: "Asset",
    expected_return_rate: 8,
  },
  {
    id: accountIds.retirement,
    name: "401(k)",
    type: "Asset",
    expected_return_rate: 7,
  },
  {
    id: accountIds.mortgage,
    name: "Home Mortgage",
    type: "Liability",
    expected_return_rate: null,
  },
  {
    id: accountIds.creditCard,
    name: "Credit Card",
    type: "Liability",
    expected_return_rate: null,
  },
];

const insertAccount = db.prepare(
  `INSERT INTO accounts (id, user_id, name, type, expected_return_rate) VALUES (?, ?, ?, ?, ?)`,
);
for (const a of accountRows) {
  insertAccount.run(a.id, PLACEHOLDER_USER_ID, a.name, a.type, a.expected_return_rate);
}

// ---------------------------------------------------------------------------
// 2. Scenarios
// ---------------------------------------------------------------------------
const insertScenario = db.prepare(
  `INSERT INTO scenarios (id, user_id, name) VALUES (?, ?, ?)`,
);
insertScenario.run(scenarioIds.basePlan, PLACEHOLDER_USER_ID, "Base Plan");
insertScenario.run(scenarioIds.aggressive, PLACEHOLDER_USER_ID, "Aggressive Savings");

// Set Base Plan as active
db.prepare(
  `INSERT INTO settings (user_id, key, value) VALUES (?, 'activeScenarioId', ?)`,
).run(PLACEHOLDER_USER_ID, scenarioIds.basePlan);

// ---------------------------------------------------------------------------
// 3. Goals
// ---------------------------------------------------------------------------
const insertGoal = db.prepare(
  `INSERT INTO goals (id, user_id, name, target_amount) VALUES (?, ?, ?, ?)`,
);
insertGoal.run(goalIds.emergency, PLACEHOLDER_USER_ID, "Emergency Fund", 25000);
insertGoal.run(goalIds.downPayment, PLACEHOLDER_USER_ID, "House Down Payment", 100000);
insertGoal.run(goalIds.fire, PLACEHOLDER_USER_ID, "Financial Independence", 1000000);

// ---------------------------------------------------------------------------
// 4. Transactions — historical data from July 2024 through Feb 2026
// ---------------------------------------------------------------------------
const insertTx = db.prepare(
  `INSERT INTO transactions (id, user_id, account_id, amount, date, description, is_projected, scenario_id)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
);

const txRows = [];

function addTx(accountId, amount, date, description, opts = {}) {
  txRows.push({
    id: randomUUID(),
    accountId,
    amount,
    date,
    description,
    isProjected: opts.isProjected ?? null,
    scenarioId: opts.scenarioId ?? null,
  });
}

// Opening balances — 2024-07-01
addTx(accountIds.checking, 4500, "2024-07-01", "Opening balance");
addTx(accountIds.savings, 12000, "2024-07-01", "Opening balance");
addTx(accountIds.sp500, 45000, "2024-07-01", "Opening balance");
addTx(accountIds.retirement, 75000, "2024-07-01", "Opening balance");
addTx(accountIds.mortgage, -285000, "2024-07-01", "Opening balance");
addTx(accountIds.creditCard, -1800, "2024-07-01", "Opening balance");

// Monthly transactions from Aug 2024 (month index 1) through Feb 2026 (month index 19)
const startYear = 2024;
const startMonth = 7; // July 2024 is month 0 (opening balances)

for (let m = 1; m <= 19; m++) {
  const { year, month } = shiftMonth(startYear, startMonth, m);

  // -- Salary (1st)
  addTx(
    accountIds.checking,
    6500,
    dateStr(year, month, 1),
    "Salary deposit",
  );

  // -- Mortgage payment from checking (3rd)
  addTx(
    accountIds.checking,
    -2100,
    dateStr(year, month, 3),
    "Mortgage payment",
  );

  // -- Mortgage principal reduction (3rd) — ~$850 of the $2100 goes to principal
  addTx(
    accountIds.mortgage,
    850,
    dateStr(year, month, 3),
    "Mortgage principal payment",
  );

  // -- Transfer to savings (5th)
  addTx(
    accountIds.checking,
    -1000,
    dateStr(year, month, 5),
    "Transfer to savings",
  );
  addTx(
    accountIds.savings,
    1000,
    dateStr(year, month, 5),
    "Transfer from checking",
  );

  // -- Investment contribution (15th)
  addTx(
    accountIds.checking,
    -500,
    dateStr(year, month, 15),
    "Investment contribution",
  );
  addTx(
    accountIds.sp500,
    500,
    dateStr(year, month, 15),
    "Monthly contribution",
  );

  // -- 401(k) contributions (1st)
  addTx(
    accountIds.retirement,
    750,
    dateStr(year, month, 1),
    "401(k) employee contribution",
  );
  addTx(
    accountIds.retirement,
    325,
    dateStr(year, month, 1),
    "401(k) employer match",
  );

  // -- Groceries (8th and 22nd)
  addTx(
    accountIds.creditCard,
    -(280 + Math.round((m % 5) * 12)),
    dateStr(year, month, 8),
    "Grocery store",
  );
  addTx(
    accountIds.creditCard,
    -(250 + Math.round((m % 4) * 15)),
    dateStr(year, month, 22),
    "Grocery store",
  );

  // -- Utilities (12th)
  addTx(
    accountIds.checking,
    -(180 + Math.round((m % 3) * 20)),
    dateStr(year, month, 12),
    "Utilities",
  );

  // -- Gas / Transportation (10th)
  addTx(
    accountIds.creditCard,
    -(60 + Math.round((m % 6) * 8)),
    dateStr(year, month, 10),
    "Gas station",
  );

  // -- Credit card payment (25th) — pay off roughly what was charged
  const ccCharges =
    280 +
    Math.round((m % 5) * 12) +
    250 +
    Math.round((m % 4) * 15) +
    60 +
    Math.round((m % 6) * 8);
  addTx(
    accountIds.checking,
    -ccCharges,
    dateStr(year, month, 25),
    "Credit card payment",
  );
  addTx(
    accountIds.creditCard,
    ccCharges,
    dateStr(year, month, 25),
    "Payment received",
  );

  // -- Dining out (18th, occasional)
  if (m % 2 === 0) {
    addTx(
      accountIds.creditCard,
      -(75 + Math.round((m % 3) * 20)),
      dateStr(year, month, 18),
      "Restaurant",
    );
  }

  // -- Subscription services (1st)
  addTx(
    accountIds.creditCard,
    -45,
    dateStr(year, month, 1),
    "Streaming subscriptions",
  );
}

// A couple of one-off transactions for realism
addTx(accountIds.checking, -1200, "2024-12-20", "Holiday gifts");
addTx(accountIds.creditCard, -350, "2025-03-15", "Annual insurance premium");
addTx(accountIds.checking, 2000, "2025-04-15", "Tax refund");
addTx(accountIds.creditCard, -800, "2025-07-10", "Summer vacation");
addTx(accountIds.checking, -450, "2025-09-05", "Car maintenance");
addTx(accountIds.sp500, 3000, "2025-01-02", "Annual bonus invested");

// -- Scenario-specific projected transactions (Aggressive Savings) --
// Extra savings & investment contributions starting next month
addTx(
  accountIds.savings,
  500,
  "2026-03-01",
  "Extra savings transfer",
  { isProjected: true, scenarioId: scenarioIds.aggressive },
);
addTx(
  accountIds.sp500,
  1000,
  "2026-03-01",
  "Extra investment contribution",
  { isProjected: true, scenarioId: scenarioIds.aggressive },
);
addTx(
  accountIds.savings,
  500,
  "2026-04-01",
  "Extra savings transfer",
  { isProjected: true, scenarioId: scenarioIds.aggressive },
);
addTx(
  accountIds.sp500,
  1000,
  "2026-04-01",
  "Extra investment contribution",
  { isProjected: true, scenarioId: scenarioIds.aggressive },
);

// Insert all transactions
const insertTxBatch = db.transaction(() => {
  for (const t of txRows) {
    insertTx.run(
      t.id,
      PLACEHOLDER_USER_ID,
      t.accountId,
      t.amount,
      t.date,
      t.description,
      t.isProjected === true ? 1 : null,
      t.scenarioId,
    );
  }
});
insertTxBatch();

// ---------------------------------------------------------------------------
// 5. Recurring transactions
// ---------------------------------------------------------------------------
const insertRecurring = db.prepare(
  `INSERT INTO recurring_transactions (id, user_id, account_id, amount, description, frequency, start_date, end_date, scenario_id)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
);

const recurringRows = [
  // Base Plan recurring transactions
  {
    accountId: accountIds.checking,
    amount: 6500,
    description: "Monthly salary",
    frequency: "Monthly",
    startDate: "2024-08-01",
  },
  {
    accountId: accountIds.checking,
    amount: -2100,
    description: "Mortgage payment",
    frequency: "Monthly",
    startDate: "2024-08-01",
    endDate: "2039-07-01",
  },
  {
    accountId: accountIds.mortgage,
    amount: 850,
    description: "Mortgage principal",
    frequency: "Monthly",
    startDate: "2024-08-01",
    endDate: "2039-07-01",
  },
  {
    accountId: accountIds.checking,
    amount: -1000,
    description: "Transfer to savings",
    frequency: "Monthly",
    startDate: "2024-08-01",
  },
  {
    accountId: accountIds.savings,
    amount: 1000,
    description: "Savings deposit",
    frequency: "Monthly",
    startDate: "2024-08-01",
  },
  {
    accountId: accountIds.checking,
    amount: -500,
    description: "Investment contribution",
    frequency: "Monthly",
    startDate: "2024-08-01",
  },
  {
    accountId: accountIds.sp500,
    amount: 500,
    description: "Monthly investment",
    frequency: "Monthly",
    startDate: "2024-08-01",
  },
  {
    accountId: accountIds.retirement,
    amount: 750,
    description: "401(k) contribution",
    frequency: "Monthly",
    startDate: "2024-08-01",
  },
  {
    accountId: accountIds.retirement,
    amount: 325,
    description: "401(k) employer match",
    frequency: "Monthly",
    startDate: "2024-08-01",
  },
  // Property tax (yearly)
  {
    accountId: accountIds.checking,
    amount: -4200,
    description: "Property tax",
    frequency: "Yearly",
    startDate: "2024-12-01",
  },
  // Aggressive Savings scenario — extra contributions
  {
    accountId: accountIds.savings,
    amount: 500,
    description: "Extra savings transfer",
    frequency: "Monthly",
    startDate: "2026-03-01",
    scenarioId: scenarioIds.aggressive,
  },
  {
    accountId: accountIds.sp500,
    amount: 1000,
    description: "Extra investment contribution",
    frequency: "Monthly",
    startDate: "2026-03-01",
    scenarioId: scenarioIds.aggressive,
  },
  {
    accountId: accountIds.checking,
    amount: -1500,
    description: "Extra transfers (savings + investment)",
    frequency: "Monthly",
    startDate: "2026-03-01",
    scenarioId: scenarioIds.aggressive,
  },
];

const insertRecurringBatch = db.transaction(() => {
  for (const r of recurringRows) {
    insertRecurring.run(
      randomUUID(),
      PLACEHOLDER_USER_ID,
      r.accountId,
      r.amount,
      r.description,
      r.frequency,
      r.startDate,
      r.endDate ?? null,
      r.scenarioId ?? null,
    );
  }
});
insertRecurringBatch();

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
const counts = {
  accounts: db.prepare("SELECT COUNT(*) as c FROM accounts").get().c,
  transactions: db.prepare("SELECT COUNT(*) as c FROM transactions").get().c,
  recurringTransactions: db
    .prepare("SELECT COUNT(*) as c FROM recurring_transactions")
    .get().c,
  scenarios: db.prepare("SELECT COUNT(*) as c FROM scenarios").get().c,
  goals: db.prepare("SELECT COUNT(*) as c FROM goals").get().c,
};

console.log("Seed data inserted successfully!");
console.log(
  `  ${counts.accounts} accounts, ${counts.transactions} transactions, ` +
    `${counts.recurringTransactions} recurring transactions, ` +
    `${counts.scenarios} scenarios, ${counts.goals} goals`,
);

db.close();

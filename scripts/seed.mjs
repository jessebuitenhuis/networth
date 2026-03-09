import { randomUUID } from "crypto";
import postgres from "postgres";

const PLACEHOLDER_USER_ID = "placeholder-user-id";

// ---------------------------------------------------------------------------
// Database connection
// ---------------------------------------------------------------------------
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Missing DATABASE_URL environment variable");
  process.exit(1);
}

const sql = postgres(databaseUrl);

// ---------------------------------------------------------------------------
// Clear existing data
// ---------------------------------------------------------------------------
await sql`DELETE FROM transactions`;
await sql`DELETE FROM recurring_transactions`;
await sql`DELETE FROM goals`;
await sql`DELETE FROM settings`;
await sql`DELETE FROM scenarios`;
await sql`DELETE FROM accounts`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function pad(n) {
  return String(n).padStart(2, "0");
}

function dateStr(year, month, day) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

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
  { id: accountIds.checking, name: "Checking Account", type: "Asset", expected_return_rate: null },
  { id: accountIds.savings, name: "High-Yield Savings", type: "Asset", expected_return_rate: null },
  { id: accountIds.sp500, name: "S&P 500 ETF", type: "Asset", expected_return_rate: 8 },
  { id: accountIds.retirement, name: "401(k)", type: "Asset", expected_return_rate: 7 },
  { id: accountIds.mortgage, name: "Home Mortgage", type: "Liability", expected_return_rate: null },
  { id: accountIds.creditCard, name: "Credit Card", type: "Liability", expected_return_rate: null },
];

for (const a of accountRows) {
  await sql`INSERT INTO accounts (id, user_id, name, type, expected_return_rate) VALUES (${a.id}, ${PLACEHOLDER_USER_ID}, ${a.name}, ${a.type}, ${a.expected_return_rate})`;
}

// ---------------------------------------------------------------------------
// 2. Scenarios
// ---------------------------------------------------------------------------
await sql`INSERT INTO scenarios (id, user_id, name) VALUES (${scenarioIds.basePlan}, ${PLACEHOLDER_USER_ID}, ${"Base Plan"})`;
await sql`INSERT INTO scenarios (id, user_id, name) VALUES (${scenarioIds.aggressive}, ${PLACEHOLDER_USER_ID}, ${"Aggressive Savings"})`;

await sql`INSERT INTO settings (user_id, key, value) VALUES (${PLACEHOLDER_USER_ID}, ${"activeScenarioId"}, ${scenarioIds.basePlan})`;

// ---------------------------------------------------------------------------
// 3. Goals
// ---------------------------------------------------------------------------
await sql`INSERT INTO goals (id, user_id, name, target_amount) VALUES (${goalIds.emergency}, ${PLACEHOLDER_USER_ID}, ${"Emergency Fund"}, ${25000})`;
await sql`INSERT INTO goals (id, user_id, name, target_amount) VALUES (${goalIds.downPayment}, ${PLACEHOLDER_USER_ID}, ${"House Down Payment"}, ${100000})`;
await sql`INSERT INTO goals (id, user_id, name, target_amount) VALUES (${goalIds.fire}, ${PLACEHOLDER_USER_ID}, ${"Financial Independence"}, ${1000000})`;

// ---------------------------------------------------------------------------
// 4. Transactions — historical data from July 2024 through Feb 2026
// ---------------------------------------------------------------------------
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
const startMonth = 7;

for (let m = 1; m <= 19; m++) {
  const { year, month } = shiftMonth(startYear, startMonth, m);

  addTx(accountIds.checking, 6500, dateStr(year, month, 1), "Salary deposit");
  addTx(accountIds.checking, -2100, dateStr(year, month, 3), "Mortgage payment");
  addTx(accountIds.mortgage, 850, dateStr(year, month, 3), "Mortgage principal payment");
  addTx(accountIds.checking, -1000, dateStr(year, month, 5), "Transfer to savings");
  addTx(accountIds.savings, 1000, dateStr(year, month, 5), "Transfer from checking");
  addTx(accountIds.checking, -500, dateStr(year, month, 15), "Investment contribution");
  addTx(accountIds.sp500, 500, dateStr(year, month, 15), "Monthly contribution");
  addTx(accountIds.retirement, 750, dateStr(year, month, 1), "401(k) employee contribution");
  addTx(accountIds.retirement, 325, dateStr(year, month, 1), "401(k) employer match");
  addTx(accountIds.creditCard, -(280 + Math.round((m % 5) * 12)), dateStr(year, month, 8), "Grocery store");
  addTx(accountIds.creditCard, -(250 + Math.round((m % 4) * 15)), dateStr(year, month, 22), "Grocery store");
  addTx(accountIds.checking, -(180 + Math.round((m % 3) * 20)), dateStr(year, month, 12), "Utilities");
  addTx(accountIds.creditCard, -(60 + Math.round((m % 6) * 8)), dateStr(year, month, 10), "Gas station");

  const ccCharges =
    280 + Math.round((m % 5) * 12) +
    250 + Math.round((m % 4) * 15) +
    60 + Math.round((m % 6) * 8);
  addTx(accountIds.checking, -ccCharges, dateStr(year, month, 25), "Credit card payment");
  addTx(accountIds.creditCard, ccCharges, dateStr(year, month, 25), "Payment received");

  if (m % 2 === 0) {
    addTx(accountIds.creditCard, -(75 + Math.round((m % 3) * 20)), dateStr(year, month, 18), "Restaurant");
  }

  addTx(accountIds.creditCard, -45, dateStr(year, month, 1), "Streaming subscriptions");
}

addTx(accountIds.checking, -1200, "2024-12-20", "Holiday gifts");
addTx(accountIds.creditCard, -350, "2025-03-15", "Annual insurance premium");
addTx(accountIds.checking, 2000, "2025-04-15", "Tax refund");
addTx(accountIds.creditCard, -800, "2025-07-10", "Summer vacation");
addTx(accountIds.checking, -450, "2025-09-05", "Car maintenance");
addTx(accountIds.sp500, 3000, "2025-01-02", "Annual bonus invested");

addTx(accountIds.savings, 500, "2026-03-01", "Extra savings transfer", { isProjected: true, scenarioId: scenarioIds.aggressive });
addTx(accountIds.sp500, 1000, "2026-03-01", "Extra investment contribution", { isProjected: true, scenarioId: scenarioIds.aggressive });
addTx(accountIds.savings, 500, "2026-04-01", "Extra savings transfer", { isProjected: true, scenarioId: scenarioIds.aggressive });
addTx(accountIds.sp500, 1000, "2026-04-01", "Extra investment contribution", { isProjected: true, scenarioId: scenarioIds.aggressive });

// Insert all transactions in a batch
await sql.begin(async (sql) => {
  for (const t of txRows) {
    await sql`INSERT INTO transactions (id, user_id, account_id, amount, date, description, is_projected, scenario_id) VALUES (${t.id}, ${PLACEHOLDER_USER_ID}, ${t.accountId}, ${t.amount}, ${t.date}, ${t.description}, ${t.isProjected}, ${t.scenarioId})`;
  }
});

// ---------------------------------------------------------------------------
// 5. Recurring transactions
// ---------------------------------------------------------------------------
const recurringRows = [
  { accountId: accountIds.checking, amount: 6500, description: "Monthly salary", frequency: "Monthly", startDate: "2024-08-01" },
  { accountId: accountIds.checking, amount: -2100, description: "Mortgage payment", frequency: "Monthly", startDate: "2024-08-01", endDate: "2039-07-01" },
  { accountId: accountIds.mortgage, amount: 850, description: "Mortgage principal", frequency: "Monthly", startDate: "2024-08-01", endDate: "2039-07-01" },
  { accountId: accountIds.checking, amount: -1000, description: "Transfer to savings", frequency: "Monthly", startDate: "2024-08-01" },
  { accountId: accountIds.savings, amount: 1000, description: "Savings deposit", frequency: "Monthly", startDate: "2024-08-01" },
  { accountId: accountIds.checking, amount: -500, description: "Investment contribution", frequency: "Monthly", startDate: "2024-08-01" },
  { accountId: accountIds.sp500, amount: 500, description: "Monthly investment", frequency: "Monthly", startDate: "2024-08-01" },
  { accountId: accountIds.retirement, amount: 750, description: "401(k) contribution", frequency: "Monthly", startDate: "2024-08-01" },
  { accountId: accountIds.retirement, amount: 325, description: "401(k) employer match", frequency: "Monthly", startDate: "2024-08-01" },
  { accountId: accountIds.checking, amount: -4200, description: "Property tax", frequency: "Yearly", startDate: "2024-12-01" },
  { accountId: accountIds.savings, amount: 500, description: "Extra savings transfer", frequency: "Monthly", startDate: "2026-03-01", scenarioId: scenarioIds.aggressive },
  { accountId: accountIds.sp500, amount: 1000, description: "Extra investment contribution", frequency: "Monthly", startDate: "2026-03-01", scenarioId: scenarioIds.aggressive },
  { accountId: accountIds.checking, amount: -1500, description: "Extra transfers (savings + investment)", frequency: "Monthly", startDate: "2026-03-01", scenarioId: scenarioIds.aggressive },
];

await sql.begin(async (sql) => {
  for (const r of recurringRows) {
    await sql`INSERT INTO recurring_transactions (id, user_id, account_id, amount, description, frequency, start_date, end_date, scenario_id) VALUES (${randomUUID()}, ${PLACEHOLDER_USER_ID}, ${r.accountId}, ${r.amount}, ${r.description}, ${r.frequency}, ${r.startDate}, ${r.endDate ?? null}, ${r.scenarioId ?? null})`;
  }
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
const [{ count: accountCount }] = await sql`SELECT COUNT(*) as count FROM accounts`;
const [{ count: txCount }] = await sql`SELECT COUNT(*) as count FROM transactions`;
const [{ count: rtCount }] = await sql`SELECT COUNT(*) as count FROM recurring_transactions`;
const [{ count: scenarioCount }] = await sql`SELECT COUNT(*) as count FROM scenarios`;
const [{ count: goalCount }] = await sql`SELECT COUNT(*) as count FROM goals`;

console.log("Seed data inserted successfully!");
console.log(
  `  ${accountCount} accounts, ${txCount} transactions, ` +
    `${rtCount} recurring transactions, ` +
    `${scenarioCount} scenarios, ${goalCount} goals`,
);

await sql.end();

import { boolean, doublePrecision, pgTable, primaryKey, text } from "drizzle-orm/pg-core";

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  expectedReturnRate: doublePrecision("expected_return_rate"),
});

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  accountId: text("account_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  date: text("date").notNull(),
  description: text("description").notNull(),
  isProjected: boolean("is_projected"),
  scenarioId: text("scenario_id"),
  categoryId: text("category_id"),
});

export const recurringTransactions = pgTable("recurring_transactions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  accountId: text("account_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  description: text("description").notNull(),
  frequency: text("frequency").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  scenarioId: text("scenario_id"),
  categoryId: text("category_id"),
});

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  parentCategoryId: text("parent_category_id"),
});

export const scenarios = pgTable("scenarios", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  inflationRate: doublePrecision("inflation_rate"),
});

export const goals = pgTable("goals", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  targetAmount: doublePrecision("target_amount").notNull(),
});

export const settings = pgTable(
  "settings",
  {
    userId: text("user_id").notNull(),
    key: text("key").notNull(),
    value: text("value"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.key] }),
  }),
);

import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  expectedReturnRate: real("expected_return_rate"),
});

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  amount: real("amount").notNull(),
  date: text("date").notNull(),
  description: text("description").notNull(),
  isProjected: integer("is_projected", { mode: "boolean" }),
  scenarioId: text("scenario_id"),
  categoryId: text("category_id"),
});

export const recurringTransactions = sqliteTable("recurring_transactions", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  amount: real("amount").notNull(),
  description: text("description").notNull(),
  frequency: text("frequency").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  scenarioId: text("scenario_id"),
  categoryId: text("category_id"),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  parentCategoryId: text("parent_category_id"),
});

export const scenarios = sqliteTable("scenarios", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  inflationRate: real("inflation_rate"),
});

export const goals = sqliteTable("goals", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  targetAmount: real("target_amount").notNull(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value"),
});

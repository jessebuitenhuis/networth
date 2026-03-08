import Database from "better-sqlite3";
import { type BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import { type SQLiteTable } from "drizzle-orm/sqlite-core";
import { vi } from "vitest";

import * as schema from "@/db/schema";

export const TEST_USER_ID = "test-user";

export interface TestDb {
  insert(table: SQLiteTable): {
    values(data: Record<string, unknown> | Record<string, unknown>[]): { run(): void };
  };
  delete(table: SQLiteTable): { run(): void };
  raw: BetterSQLite3Database<typeof schema>;
}

export function createTestDb(): TestDb {
  const sqlite = new Database(":memory:");

  sqlite.exec(`
    CREATE TABLE accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      expected_return_rate REAL
    );

    CREATE TABLE transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      is_projected INTEGER,
      scenario_id TEXT,
      category_id TEXT
    );

    CREATE TABLE recurring_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      frequency TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      scenario_id TEXT,
      category_id TEXT
    );

    CREATE TABLE categories (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      parent_category_id TEXT
    );

    CREATE TABLE scenarios (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      inflation_rate REAL
    );

    CREATE TABLE goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL
    );

    CREATE TABLE settings (
      user_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT,
      PRIMARY KEY (user_id, key)
    );
  `);

  const db = drizzle(sqlite, { schema });

  vi.doMock("@/db/connection", () => ({ globalDb: db }));
  vi.doMock("@/auth/getCurrentUserId", () => ({
    getCurrentUserId: () => Promise.resolve(TEST_USER_ID),
  }));

  return {
    insert(table: SQLiteTable) {
      return {
        values(data: Record<string, unknown> | Record<string, unknown>[]) {
          const addUserId = (row: Record<string, unknown>) => ({ ...row, userId: TEST_USER_ID });
          const withUserId = Array.isArray(data) ? data.map(addUserId) : addUserId(data);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return db.insert(table).values(withUserId as any);
        },
      };
    },
    delete(table: SQLiteTable) {
      return db.delete(table);
    },
    raw: db,
  };
}

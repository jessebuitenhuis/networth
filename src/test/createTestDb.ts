import { PGlite } from "@electric-sql/pglite";
import { type PgTable } from "drizzle-orm/pg-core";
import { drizzle,type PgliteDatabase } from "drizzle-orm/pglite";
import { vi } from "vitest";

import * as schema from "@/db/schema";

export const TEST_USER_ID = "test-user";

export interface TestDb {
  insert(table: PgTable): {
    values(data: Record<string, unknown> | Record<string, unknown>[]): Promise<void>;
  };
  delete(table: PgTable): Promise<void>;
  raw: PgliteDatabase<typeof schema>;
}

export async function createTestDb(): Promise<TestDb> {
  const pglite = new PGlite();

  await pglite.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      expected_return_rate DOUBLE PRECISION
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      amount DOUBLE PRECISION NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      is_projected BOOLEAN,
      scenario_id TEXT,
      category_id TEXT
    );

    CREATE TABLE IF NOT EXISTS recurring_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      amount DOUBLE PRECISION NOT NULL,
      description TEXT NOT NULL,
      frequency TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      scenario_id TEXT,
      category_id TEXT
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      parent_category_id TEXT
    );

    CREATE TABLE IF NOT EXISTS scenarios (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      inflation_rate DOUBLE PRECISION
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      target_amount DOUBLE PRECISION NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      user_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT,
      PRIMARY KEY (user_id, key)
    );
  `);

  const db = drizzle(pglite, { schema });

  vi.doMock("@/db/connection", () => ({ globalDb: db }));
  vi.doMock("@/auth/getCurrentUserId", () => ({
    getCurrentUserId: () => Promise.resolve(TEST_USER_ID),
  }));

  return {
    insert(table: PgTable) {
      return {
        async values(data: Record<string, unknown> | Record<string, unknown>[]) {
          const addUserId = (row: Record<string, unknown>) => ({ ...row, userId: TEST_USER_ID });
          const withUserId = Array.isArray(data) ? data.map(addUserId) : addUserId(data);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await db.insert(table).values(withUserId as any);
        },
      };
    },
    async delete(table: PgTable) {
      await db.delete(table);
    },
    raw: db,
  };
}

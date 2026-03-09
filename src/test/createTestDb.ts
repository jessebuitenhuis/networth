import { PGlite } from "@electric-sql/pglite";
import { type PgTable } from "drizzle-orm/pg-core";
import { drizzle,type PgliteDatabase } from "drizzle-orm/pglite";
import { vi } from "vitest";

import { CREATE_TABLES_SQL } from "@/db/createTables";
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

  await pglite.exec(CREATE_TABLES_SQL);

  const db = drizzle(pglite, { schema });

  vi.doMock("@/db/connection", () => ({ globalDb: db, waitForDb: () => Promise.resolve() }));
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

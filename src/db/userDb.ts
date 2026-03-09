import { and, Column, eq, SQL } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";

import { getCurrentUserId } from "@/auth/getCurrentUserId";

import { globalDb } from "./connection";

type UserTable = PgTable & { userId: Column };

export async function getDb() {
  const userId = await getCurrentUserId();

  function userWhere(table: UserTable, extra?: SQL): SQL {
    const userCond = eq(table.userId, userId);
    return extra ? (and(userCond, extra) as SQL) : userCond;
  }

  return {
    userId,

    select<T extends UserTable>(table: T, where?: SQL) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return globalDb.select().from(table as any).where(userWhere(table, where));
    },

    insert<T extends UserTable>(table: T, data: Record<string, unknown>) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return globalDb.insert(table).values({ ...data, userId } as any);
    },

    update<T extends UserTable>(table: T, data: Record<string, unknown>, where: SQL) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return globalDb.update(table).set(data as any).where(userWhere(table, where));
    },

    delete<T extends UserTable>(table: T, where: SQL) {
      return globalDb.delete(table).where(userWhere(table, where));
    },
  };
}

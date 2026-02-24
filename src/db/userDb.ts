import { and, eq, SQL } from "drizzle-orm";
import { SQLiteTable } from "drizzle-orm/sqlite-core";

import { getCurrentUserId } from "@/lib/getCurrentUserId";

import { db } from "./connection";

export function getUserDb() {
  const userId = getCurrentUserId();

  function userWhere(table: { userId: any }, extra?: SQL): SQL {
    const userCond = eq(table.userId, userId);
    return extra ? (and(userCond, extra) as SQL) : userCond;
  }

  return {
    userId,

    select<T extends SQLiteTable>(table: T, where?: SQL) {
      return db.select().from(table).where(userWhere(table as any, where));
    },

    insert<T extends SQLiteTable>(table: T, data: Record<string, unknown>) {
      return db.insert(table).values({ ...data, userId } as any);
    },

    update<T extends SQLiteTable>(table: T, data: Record<string, unknown>, where: SQL) {
      return db.update(table).set(data as any).where(userWhere(table as any, where));
    },

    delete<T extends SQLiteTable>(table: T, where: SQL) {
      return db.delete(table).where(userWhere(table as any, where));
    },
  };
}

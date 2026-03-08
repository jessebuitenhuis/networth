import { and, Column, eq, SQL } from "drizzle-orm";
import { SQLiteTable } from "drizzle-orm/sqlite-core";

import { db } from "./connection";

type UserTable = SQLiteTable & { userId: Column };

export function getUserDb(userId: string) {
  function userWhere(table: UserTable, extra?: SQL): SQL {
    const userCond = eq(table.userId, userId);
    return extra ? (and(userCond, extra) as SQL) : userCond;
  }

  return {
    userId,

    select<T extends UserTable>(table: T, where?: SQL) {
      return db.select().from(table).where(userWhere(table, where));
    },

    insert<T extends UserTable>(table: T, data: Record<string, unknown>) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return db.insert(table).values({ ...data, userId } as any);
    },

    update<T extends UserTable>(table: T, data: Record<string, unknown>, where: SQL) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return db.update(table).set(data as any).where(userWhere(table, where));
    },

    delete<T extends UserTable>(table: T, where: SQL) {
      return db.delete(table).where(userWhere(table, where));
    },
  };
}

import { and, eq } from "drizzle-orm";

import { db } from "@/db/connection";
import { accounts } from "@/db/schema";
import { getCurrentUserId } from "@/lib/getCurrentUserId";

export function getAllAccounts() {
  const userId = getCurrentUserId();
  return db.select().from(accounts).where(eq(accounts.userId, userId)).all();
}

export function getAccountById(id: string) {
  const userId = getCurrentUserId();
  const [row] = db
    .select()
    .from(accounts)
    .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
    .all();
  return row;
}

export function createAccount({
  id,
  name,
  type,
  expectedReturnRate,
}: {
  id: string;
  name: string;
  type: string;
  expectedReturnRate?: number | null;
}) {
  const userId = getCurrentUserId();
  db.insert(accounts)
    .values({
      id,
      userId,
      name,
      type,
      expectedReturnRate: expectedReturnRate ?? null,
    })
    .run();

  return getAccountById(id)!;
}

export function updateAccount(
  id: string,
  {
    name,
    type,
    expectedReturnRate,
  }: {
    name: string;
    type: string;
    expectedReturnRate?: number | null;
  },
) {
  const userId = getCurrentUserId();
  db.update(accounts)
    .set({
      name,
      type,
      expectedReturnRate: expectedReturnRate ?? null,
    })
    .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
    .run();

  return getAccountById(id)!;
}

export function deleteAccount(id: string) {
  const userId = getCurrentUserId();
  db.delete(accounts)
    .where(and(eq(accounts.id, id), eq(accounts.userId, userId)))
    .run();
}

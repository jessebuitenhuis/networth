import { eq } from "drizzle-orm";

import { accounts } from "@/db/schema";
import { getUserDb } from "@/db/userDb";

export function getAllAccounts(userId: string) {
  return getUserDb(userId).select(accounts).all();
}

export function getAccountById(userId: string, id: string) {
  const [row] = getUserDb(userId).select(accounts, eq(accounts.id, id)).all();
  return row;
}

export function createAccount(
  userId: string,
  {
    id,
    name,
    type,
    expectedReturnRate,
  }: {
    id: string;
    name: string;
    type: string;
    expectedReturnRate?: number | null;
  },
) {
  getUserDb(userId).insert(accounts, { id, name, type, expectedReturnRate: expectedReturnRate ?? null }).run();
  return getAccountById(userId, id)!;
}

export function updateAccount(
  userId: string,
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
  getUserDb(userId)
    .update(accounts, { name, type, expectedReturnRate: expectedReturnRate ?? null }, eq(accounts.id, id))
    .run();
  return getAccountById(userId, id)!;
}

export function deleteAccount(userId: string, id: string) {
  getUserDb(userId).delete(accounts, eq(accounts.id, id)).run();
}

import { eq } from "drizzle-orm";

import { getUserDb } from "@/db/userDb";
import { accounts } from "@/db/schema";

export function getAllAccounts() {
  return getUserDb().select(accounts).all();
}

export function getAccountById(id: string) {
  const [row] = getUserDb().select(accounts, eq(accounts.id, id)).all();
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
  getUserDb().insert(accounts, { id, name, type, expectedReturnRate: expectedReturnRate ?? null }).run();
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
  getUserDb()
    .update(accounts, { name, type, expectedReturnRate: expectedReturnRate ?? null }, eq(accounts.id, id))
    .run();
  return getAccountById(id)!;
}

export function deleteAccount(id: string) {
  getUserDb().delete(accounts, eq(accounts.id, id)).run();
}

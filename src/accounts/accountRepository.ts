import { eq } from "drizzle-orm";

import { accounts } from "@/db/schema";
import { getDb } from "@/db/userDb";

export async function getAllAccounts() {
  return (await getDb()).select(accounts).all();
}

export async function getAccountById(id: string) {
  const [row] = (await getDb()).select(accounts, eq(accounts.id, id)).all();
  return row;
}

export async function createAccount({
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
  (await getDb()).insert(accounts, { id, name, type, expectedReturnRate: expectedReturnRate ?? null }).run();
  return (await getAccountById(id))!;
}

export async function updateAccount(
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
  (await getDb())
    .update(accounts, { name, type, expectedReturnRate: expectedReturnRate ?? null }, eq(accounts.id, id))
    .run();
  return (await getAccountById(id))!;
}

export async function deleteAccount(id: string) {
  (await getDb()).delete(accounts, eq(accounts.id, id)).run();
}

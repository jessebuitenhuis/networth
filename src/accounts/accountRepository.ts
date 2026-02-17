import { eq } from "drizzle-orm";

import { db } from "@/db/connection";
import { accounts } from "@/db/schema";

export function getAllAccounts() {
  return db.select().from(accounts).all();
}

export function getAccountById(id: string) {
  const [row] = db.select().from(accounts).where(eq(accounts.id, id)).all();
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
  db.insert(accounts)
    .values({
      id,
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
  db.update(accounts)
    .set({
      name,
      type,
      expectedReturnRate: expectedReturnRate ?? null,
    })
    .where(eq(accounts.id, id))
    .run();

  return getAccountById(id)!;
}

export function deleteAccount(id: string) {
  db.delete(accounts).where(eq(accounts.id, id)).run();
}

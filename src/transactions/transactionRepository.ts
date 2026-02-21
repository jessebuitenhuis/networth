import { eq } from "drizzle-orm";

import { db } from "@/db/connection";
import { transactions } from "@/db/schema";

export function getAllTransactions() {
  return db.select().from(transactions).all();
}

export function getTransactionById(id: string) {
  const rows = db
    .select()
    .from(transactions)
    .where(eq(transactions.id, id))
    .all();
  return rows[0];
}

export function createTransaction(data: {
  id: string;
  accountId: string;
  amount: number;
  date: string;
  description: string;
  isProjected?: boolean | null;
  scenarioId?: string | null;
  categoryId?: string | null;
}) {
  db.insert(transactions)
    .values({
      id: data.id,
      accountId: data.accountId,
      amount: data.amount,
      date: data.date,
      description: data.description,
      isProjected: data.isProjected ?? null,
      scenarioId: data.scenarioId ?? null,
      categoryId: data.categoryId ?? null,
    })
    .run();

  return getTransactionById(data.id)!;
}

export function createTransactions(items: {
  id: string;
  accountId: string;
  amount: number;
  date: string;
  description: string;
  isProjected?: boolean | null;
  scenarioId?: string | null;
  categoryId?: string | null;
}[]) {
  for (const item of items) {
    db.insert(transactions)
      .values({
        id: item.id,
        accountId: item.accountId,
        amount: item.amount,
        date: item.date,
        description: item.description,
        isProjected: item.isProjected ?? null,
        scenarioId: item.scenarioId ?? null,
        categoryId: item.categoryId ?? null,
      })
      .run();
  }

  const ids = items.map((item) => item.id);
  return db
    .select()
    .from(transactions)
    .all()
    .filter((row) => ids.includes(row.id));
}

export function updateTransaction(id: string, data: {
  accountId: string;
  amount: number;
  date: string;
  description: string;
  isProjected?: boolean | null;
  scenarioId?: string | null;
  categoryId?: string | null;
}) {
  db.update(transactions)
    .set({
      accountId: data.accountId,
      amount: data.amount,
      date: data.date,
      description: data.description,
      isProjected: data.isProjected ?? null,
      scenarioId: data.scenarioId ?? null,
      categoryId: data.categoryId ?? null,
    })
    .where(eq(transactions.id, id))
    .run();

  return getTransactionById(id)!;
}

export function deleteTransaction(id: string) {
  db.delete(transactions).where(eq(transactions.id, id)).run();
}

export function deleteTransactionsByAccountId(accountId: string) {
  db.delete(transactions).where(eq(transactions.accountId, accountId)).run();
}

export function deleteTransactionsByScenarioId(scenarioId: string) {
  db.delete(transactions).where(eq(transactions.scenarioId, scenarioId)).run();
}

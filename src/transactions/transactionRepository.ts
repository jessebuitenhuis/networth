import { and, eq } from "drizzle-orm";

import { db } from "@/db/connection";
import { transactions } from "@/db/schema";
import { getCurrentUserId } from "@/lib/getCurrentUserId";

export function getAllTransactions() {
  const userId = getCurrentUserId();
  return db.select().from(transactions).where(eq(transactions.userId, userId)).all();
}

export function getTransactionById(id: string) {
  const userId = getCurrentUserId();
  const rows = db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
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
  const userId = getCurrentUserId();
  db.insert(transactions)
    .values({
      id: data.id,
      userId,
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
  const userId = getCurrentUserId();
  for (const item of items) {
    db.insert(transactions)
      .values({
        id: item.id,
        userId,
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
    .where(eq(transactions.userId, userId))
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
  const userId = getCurrentUserId();
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
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .run();

  return getTransactionById(id)!;
}

export function deleteTransaction(id: string) {
  const userId = getCurrentUserId();
  db.delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .run();
}

export function deleteTransactionsByAccountId(accountId: string) {
  const userId = getCurrentUserId();
  db.delete(transactions)
    .where(and(eq(transactions.accountId, accountId), eq(transactions.userId, userId)))
    .run();
}

export function deleteTransactionsByScenarioId(scenarioId: string) {
  const userId = getCurrentUserId();
  db.delete(transactions)
    .where(and(eq(transactions.scenarioId, scenarioId), eq(transactions.userId, userId)))
    .run();
}

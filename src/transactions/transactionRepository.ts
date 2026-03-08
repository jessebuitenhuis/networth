import { eq } from "drizzle-orm";

import { transactions } from "@/db/schema";
import { getUserDb } from "@/db/userDb";

export function getAllTransactions(userId: string) {
  return getUserDb(userId).select(transactions).all();
}

export function getTransactionById(userId: string, id: string) {
  const [row] = getUserDb(userId).select(transactions, eq(transactions.id, id)).all();
  return row;
}

export function createTransaction(userId: string, data: {
  id: string;
  accountId: string;
  amount: number;
  date: string;
  description: string;
  isProjected?: boolean | null;
  scenarioId?: string | null;
  categoryId?: string | null;
}) {
  getUserDb(userId).insert(transactions, {
    id: data.id,
    accountId: data.accountId,
    amount: data.amount,
    date: data.date,
    description: data.description,
    isProjected: data.isProjected ?? null,
    scenarioId: data.scenarioId ?? null,
    categoryId: data.categoryId ?? null,
  }).run();
  return getTransactionById(userId, data.id)!;
}

export function createTransactions(userId: string, items: {
  id: string;
  accountId: string;
  amount: number;
  date: string;
  description: string;
  isProjected?: boolean | null;
  scenarioId?: string | null;
  categoryId?: string | null;
}[]) {
  const userDb = getUserDb(userId);
  for (const item of items) {
    userDb.insert(transactions, {
      id: item.id,
      accountId: item.accountId,
      amount: item.amount,
      date: item.date,
      description: item.description,
      isProjected: item.isProjected ?? null,
      scenarioId: item.scenarioId ?? null,
      categoryId: item.categoryId ?? null,
    }).run();
  }
  const ids = items.map((item) => item.id);
  return userDb.select(transactions).all().filter((row) => ids.includes(row.id));
}

export function updateTransaction(userId: string, id: string, data: {
  accountId: string;
  amount: number;
  date: string;
  description: string;
  isProjected?: boolean | null;
  scenarioId?: string | null;
  categoryId?: string | null;
}) {
  getUserDb(userId).update(transactions, {
    accountId: data.accountId,
    amount: data.amount,
    date: data.date,
    description: data.description,
    isProjected: data.isProjected ?? null,
    scenarioId: data.scenarioId ?? null,
    categoryId: data.categoryId ?? null,
  }, eq(transactions.id, id)).run();
  return getTransactionById(userId, id)!;
}

export function deleteTransaction(userId: string, id: string) {
  getUserDb(userId).delete(transactions, eq(transactions.id, id)).run();
}

export function deleteTransactionsByAccountId(userId: string, accountId: string) {
  getUserDb(userId).delete(transactions, eq(transactions.accountId, accountId)).run();
}

export function deleteTransactionsByScenarioId(userId: string, scenarioId: string) {
  getUserDb(userId).delete(transactions, eq(transactions.scenarioId, scenarioId)).run();
}

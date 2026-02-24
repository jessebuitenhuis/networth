import { eq } from "drizzle-orm";

import { getUserDb } from "@/db/userDb";
import { transactions } from "@/db/schema";

export function getAllTransactions() {
  return getUserDb().select(transactions).all();
}

export function getTransactionById(id: string) {
  const [row] = getUserDb().select(transactions, eq(transactions.id, id)).all();
  return row;
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
  getUserDb().insert(transactions, {
    id: data.id,
    accountId: data.accountId,
    amount: data.amount,
    date: data.date,
    description: data.description,
    isProjected: data.isProjected ?? null,
    scenarioId: data.scenarioId ?? null,
    categoryId: data.categoryId ?? null,
  }).run();
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
  const userDb = getUserDb();
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

export function updateTransaction(id: string, data: {
  accountId: string;
  amount: number;
  date: string;
  description: string;
  isProjected?: boolean | null;
  scenarioId?: string | null;
  categoryId?: string | null;
}) {
  getUserDb().update(transactions, {
    accountId: data.accountId,
    amount: data.amount,
    date: data.date,
    description: data.description,
    isProjected: data.isProjected ?? null,
    scenarioId: data.scenarioId ?? null,
    categoryId: data.categoryId ?? null,
  }, eq(transactions.id, id)).run();
  return getTransactionById(id)!;
}

export function deleteTransaction(id: string) {
  getUserDb().delete(transactions, eq(transactions.id, id)).run();
}

export function deleteTransactionsByAccountId(accountId: string) {
  getUserDb().delete(transactions, eq(transactions.accountId, accountId)).run();
}

export function deleteTransactionsByScenarioId(scenarioId: string) {
  getUserDb().delete(transactions, eq(transactions.scenarioId, scenarioId)).run();
}

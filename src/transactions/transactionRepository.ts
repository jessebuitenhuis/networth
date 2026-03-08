import { eq } from "drizzle-orm";

import { transactions } from "@/db/schema";
import { getUserDb } from "@/db/userDb";

export async function getAllTransactions() {
  return (await getUserDb()).select(transactions).all();
}

export async function getTransactionById(id: string) {
  const [row] = (await getUserDb()).select(transactions, eq(transactions.id, id)).all();
  return row;
}

export async function createTransaction(data: {
  id: string;
  accountId: string;
  amount: number;
  date: string;
  description: string;
  isProjected?: boolean | null;
  scenarioId?: string | null;
  categoryId?: string | null;
}) {
  (await getUserDb()).insert(transactions, {
    id: data.id,
    accountId: data.accountId,
    amount: data.amount,
    date: data.date,
    description: data.description,
    isProjected: data.isProjected ?? null,
    scenarioId: data.scenarioId ?? null,
    categoryId: data.categoryId ?? null,
  }).run();
  return (await getTransactionById(data.id))!;
}

export async function createTransactions(items: {
  id: string;
  accountId: string;
  amount: number;
  date: string;
  description: string;
  isProjected?: boolean | null;
  scenarioId?: string | null;
  categoryId?: string | null;
}[]) {
  const userDb = await getUserDb();
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

export async function updateTransaction(id: string, data: {
  accountId: string;
  amount: number;
  date: string;
  description: string;
  isProjected?: boolean | null;
  scenarioId?: string | null;
  categoryId?: string | null;
}) {
  (await getUserDb()).update(transactions, {
    accountId: data.accountId,
    amount: data.amount,
    date: data.date,
    description: data.description,
    isProjected: data.isProjected ?? null,
    scenarioId: data.scenarioId ?? null,
    categoryId: data.categoryId ?? null,
  }, eq(transactions.id, id)).run();
  return (await getTransactionById(id))!;
}

export async function deleteTransaction(id: string) {
  (await getUserDb()).delete(transactions, eq(transactions.id, id)).run();
}

export async function deleteTransactionsByAccountId(accountId: string) {
  (await getUserDb()).delete(transactions, eq(transactions.accountId, accountId)).run();
}

export async function deleteTransactionsByScenarioId(scenarioId: string) {
  (await getUserDb()).delete(transactions, eq(transactions.scenarioId, scenarioId)).run();
}

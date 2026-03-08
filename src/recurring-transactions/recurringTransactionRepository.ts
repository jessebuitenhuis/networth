import { eq } from "drizzle-orm";

import { recurringTransactions } from "@/db/schema";
import { getUserDb } from "@/db/userDb";

export function getAllRecurringTransactions(userId: string) {
  return getUserDb(userId).select(recurringTransactions).all();
}

export function getRecurringTransactionById(userId: string, id: string) {
  const [row] = getUserDb(userId).select(recurringTransactions, eq(recurringTransactions.id, id)).all();
  return row;
}

export function createRecurringTransaction(
  userId: string,
  {
    id,
    accountId,
    amount,
    description,
    frequency,
    startDate,
    endDate,
    scenarioId,
    categoryId,
  }: {
    id: string;
    accountId: string;
    amount: number;
    description: string;
    frequency: string;
    startDate: string;
    endDate?: string | null;
    scenarioId?: string | null;
    categoryId?: string | null;
  },
) {
  getUserDb(userId).insert(recurringTransactions, {
    id,
    accountId,
    amount,
    description,
    frequency,
    startDate,
    endDate: endDate ?? null,
    scenarioId: scenarioId ?? null,
    categoryId: categoryId ?? null,
  }).run();
  return getRecurringTransactionById(userId, id)!;
}

export function updateRecurringTransaction(
  userId: string,
  id: string,
  {
    accountId,
    amount,
    description,
    frequency,
    startDate,
    endDate,
    scenarioId,
    categoryId,
  }: {
    accountId: string;
    amount: number;
    description: string;
    frequency: string;
    startDate: string;
    endDate?: string | null;
    scenarioId?: string | null;
    categoryId?: string | null;
  },
) {
  getUserDb(userId).update(recurringTransactions, {
    accountId,
    amount,
    description,
    frequency,
    startDate,
    endDate: endDate ?? null,
    scenarioId: scenarioId ?? null,
    categoryId: categoryId ?? null,
  }, eq(recurringTransactions.id, id)).run();
  return getRecurringTransactionById(userId, id)!;
}

export function deleteRecurringTransaction(userId: string, id: string) {
  getUserDb(userId).delete(recurringTransactions, eq(recurringTransactions.id, id)).run();
}

export function deleteRecurringTransactionsByScenarioId(userId: string, scenarioId: string) {
  getUserDb(userId).delete(recurringTransactions, eq(recurringTransactions.scenarioId, scenarioId)).run();
}

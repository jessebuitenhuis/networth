import { eq } from "drizzle-orm";

import { recurringTransactions } from "@/db/schema";
import { getUserDb } from "@/db/userDb";

export function getAllRecurringTransactions() {
  return getUserDb().select(recurringTransactions).all();
}

export function getRecurringTransactionById(id: string) {
  const [row] = getUserDb().select(recurringTransactions, eq(recurringTransactions.id, id)).all();
  return row;
}

export function createRecurringTransaction({
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
}) {
  getUserDb().insert(recurringTransactions, {
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
  return getRecurringTransactionById(id)!;
}

export function updateRecurringTransaction(
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
  getUserDb().update(recurringTransactions, {
    accountId,
    amount,
    description,
    frequency,
    startDate,
    endDate: endDate ?? null,
    scenarioId: scenarioId ?? null,
    categoryId: categoryId ?? null,
  }, eq(recurringTransactions.id, id)).run();
  return getRecurringTransactionById(id)!;
}

export function deleteRecurringTransaction(id: string) {
  getUserDb().delete(recurringTransactions, eq(recurringTransactions.id, id)).run();
}

export function deleteRecurringTransactionsByScenarioId(scenarioId: string) {
  getUserDb().delete(recurringTransactions, eq(recurringTransactions.scenarioId, scenarioId)).run();
}

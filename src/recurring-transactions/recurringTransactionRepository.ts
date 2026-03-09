import { eq } from "drizzle-orm";

import { recurringTransactions } from "@/db/schema";
import { getDb } from "@/db/userDb";

export async function getAllRecurringTransactions() {
  return (await getDb()).select(recurringTransactions);
}

export async function getRecurringTransactionById(id: string) {
  const [row] = await (await getDb()).select(recurringTransactions, eq(recurringTransactions.id, id));
  return row;
}

export async function createRecurringTransaction({
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
  await (await getDb()).insert(recurringTransactions, {
    id,
    accountId,
    amount,
    description,
    frequency,
    startDate,
    endDate: endDate ?? null,
    scenarioId: scenarioId ?? null,
    categoryId: categoryId ?? null,
  });
  return (await getRecurringTransactionById(id))!;
}

export async function updateRecurringTransaction(
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
  await (await getDb()).update(recurringTransactions, {
    accountId,
    amount,
    description,
    frequency,
    startDate,
    endDate: endDate ?? null,
    scenarioId: scenarioId ?? null,
    categoryId: categoryId ?? null,
  }, eq(recurringTransactions.id, id));
  return (await getRecurringTransactionById(id))!;
}

export async function deleteRecurringTransaction(id: string) {
  await (await getDb()).delete(recurringTransactions, eq(recurringTransactions.id, id));
}

export async function deleteRecurringTransactionsByScenarioId(scenarioId: string) {
  await (await getDb()).delete(recurringTransactions, eq(recurringTransactions.scenarioId, scenarioId));
}

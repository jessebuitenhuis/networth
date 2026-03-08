import { eq } from "drizzle-orm";

import { recurringTransactions } from "@/db/schema";
import { getUserDb } from "@/db/userDb";

export async function getAllRecurringTransactions() {
  return (await getUserDb()).select(recurringTransactions).all();
}

export async function getRecurringTransactionById(id: string) {
  const [row] = (await getUserDb()).select(recurringTransactions, eq(recurringTransactions.id, id)).all();
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
  (await getUserDb()).insert(recurringTransactions, {
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
  (await getUserDb()).update(recurringTransactions, {
    accountId,
    amount,
    description,
    frequency,
    startDate,
    endDate: endDate ?? null,
    scenarioId: scenarioId ?? null,
    categoryId: categoryId ?? null,
  }, eq(recurringTransactions.id, id)).run();
  return (await getRecurringTransactionById(id))!;
}

export async function deleteRecurringTransaction(id: string) {
  (await getUserDb()).delete(recurringTransactions, eq(recurringTransactions.id, id)).run();
}

export async function deleteRecurringTransactionsByScenarioId(scenarioId: string) {
  (await getUserDb()).delete(recurringTransactions, eq(recurringTransactions.scenarioId, scenarioId)).run();
}

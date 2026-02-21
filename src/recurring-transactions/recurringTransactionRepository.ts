import { eq } from "drizzle-orm";

import { db } from "@/db/connection";
import { recurringTransactions } from "@/db/schema";

export function getAllRecurringTransactions() {
  return db.select().from(recurringTransactions).all();
}

export function getRecurringTransactionById(id: string) {
  const [row] = db
    .select()
    .from(recurringTransactions)
    .where(eq(recurringTransactions.id, id))
    .all();
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
  db.insert(recurringTransactions)
    .values({
      id,
      accountId,
      amount,
      description,
      frequency,
      startDate,
      endDate: endDate ?? null,
      scenarioId: scenarioId ?? null,
      categoryId: categoryId ?? null,
    })
    .run();

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
  db.update(recurringTransactions)
    .set({
      accountId,
      amount,
      description,
      frequency,
      startDate,
      endDate: endDate ?? null,
      scenarioId: scenarioId ?? null,
      categoryId: categoryId ?? null,
    })
    .where(eq(recurringTransactions.id, id))
    .run();

  return getRecurringTransactionById(id)!;
}

export function deleteRecurringTransaction(id: string) {
  db.delete(recurringTransactions)
    .where(eq(recurringTransactions.id, id))
    .run();
}

export function deleteRecurringTransactionsByScenarioId(scenarioId: string) {
  db.delete(recurringTransactions)
    .where(eq(recurringTransactions.scenarioId, scenarioId))
    .run();
}

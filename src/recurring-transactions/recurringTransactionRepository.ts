import { and, eq } from "drizzle-orm";

import { db } from "@/db/connection";
import { recurringTransactions } from "@/db/schema";
import { getCurrentUserId } from "@/lib/getCurrentUserId";

export function getAllRecurringTransactions() {
  const userId = getCurrentUserId();
  return db
    .select()
    .from(recurringTransactions)
    .where(eq(recurringTransactions.userId, userId))
    .all();
}

export function getRecurringTransactionById(id: string) {
  const userId = getCurrentUserId();
  const [row] = db
    .select()
    .from(recurringTransactions)
    .where(and(eq(recurringTransactions.id, id), eq(recurringTransactions.userId, userId)))
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
  const userId = getCurrentUserId();
  db.insert(recurringTransactions)
    .values({
      id,
      userId,
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
  const userId = getCurrentUserId();
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
    .where(and(eq(recurringTransactions.id, id), eq(recurringTransactions.userId, userId)))
    .run();

  return getRecurringTransactionById(id)!;
}

export function deleteRecurringTransaction(id: string) {
  const userId = getCurrentUserId();
  db.delete(recurringTransactions)
    .where(and(eq(recurringTransactions.id, id), eq(recurringTransactions.userId, userId)))
    .run();
}

export function deleteRecurringTransactionsByScenarioId(scenarioId: string) {
  const userId = getCurrentUserId();
  db.delete(recurringTransactions)
    .where(
      and(
        eq(recurringTransactions.scenarioId, scenarioId),
        eq(recurringTransactions.userId, userId),
      ),
    )
    .run();
}

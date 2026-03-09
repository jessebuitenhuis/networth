import { eq } from "drizzle-orm";

import { BaseRepository } from "@/db/BaseRepository";
import { recurringTransactions } from "@/db/schema";
import { getDb } from "@/db/userDb";

class RecurringTransactionRepository extends BaseRepository<typeof recurringTransactions> {
  constructor() {
    super(recurringTransactions, recurringTransactions.id);
  }

  async createRecurringTransaction({
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
    return this.create({
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
  }

  async updateRecurringTransaction(
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
    return this.update(id, {
      accountId,
      amount,
      description,
      frequency,
      startDate,
      endDate: endDate ?? null,
      scenarioId: scenarioId ?? null,
      categoryId: categoryId ?? null,
    });
  }

  async deleteByScenarioId(scenarioId: string) {
    await (await getDb()).delete(recurringTransactions, eq(recurringTransactions.scenarioId, scenarioId));
  }
}

export const recurringTransactionRepo = new RecurringTransactionRepository();

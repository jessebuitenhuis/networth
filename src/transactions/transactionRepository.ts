import { eq } from "drizzle-orm";

import { BaseRepository } from "@/db/BaseRepository";
import { transactions } from "@/db/schema";
import { getDb } from "@/db/userDb";

class TransactionRepository extends BaseRepository<typeof transactions> {
  constructor() {
    super(transactions, transactions.id);
  }

  async createTransaction(data: {
    id: string;
    accountId: string;
    amount: number;
    date: string;
    description: string;
    isProjected?: boolean | null;
    scenarioId?: string | null;
    categoryId?: string | null;
  }) {
    return this.create({
      id: data.id,
      accountId: data.accountId,
      amount: data.amount,
      date: data.date,
      description: data.description,
      isProjected: data.isProjected ?? null,
      scenarioId: data.scenarioId ?? null,
      categoryId: data.categoryId ?? null,
    });
  }

  async createTransactions(items: {
    id: string;
    accountId: string;
    amount: number;
    date: string;
    description: string;
    isProjected?: boolean | null;
    scenarioId?: string | null;
    categoryId?: string | null;
  }[]) {
    const userDb = await getDb();
    for (const item of items) {
      await userDb.insert(transactions, {
        id: item.id,
        accountId: item.accountId,
        amount: item.amount,
        date: item.date,
        description: item.description,
        isProjected: item.isProjected ?? null,
        scenarioId: item.scenarioId ?? null,
        categoryId: item.categoryId ?? null,
      });
    }
    const ids = items.map((item) => item.id);
    const rows = await userDb.select(transactions);
    return rows.filter((row) => ids.includes(row.id));
  }

  async updateTransaction(id: string, data: {
    accountId: string;
    amount: number;
    date: string;
    description: string;
    isProjected?: boolean | null;
    scenarioId?: string | null;
    categoryId?: string | null;
  }) {
    return this.update(id, {
      accountId: data.accountId,
      amount: data.amount,
      date: data.date,
      description: data.description,
      isProjected: data.isProjected ?? null,
      scenarioId: data.scenarioId ?? null,
      categoryId: data.categoryId ?? null,
    });
  }

  async deleteByAccountId(accountId: string) {
    await (await getDb()).delete(transactions, eq(transactions.accountId, accountId));
  }

  async deleteByScenarioId(scenarioId: string) {
    await (await getDb()).delete(transactions, eq(transactions.scenarioId, scenarioId));
  }
}

export const transactionRepo = new TransactionRepository();

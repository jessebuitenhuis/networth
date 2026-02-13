import type { RecurringTransaction } from "@/models/RecurringTransaction.type";
import type { Transaction } from "@/models/Transaction.type";

export function createProjectedTransaction(
  recurring: RecurringTransaction,
  dateStr: string
): Transaction {
  return {
    id: `${recurring.id}-${dateStr}`,
    accountId: recurring.accountId,
    amount: recurring.amount,
    date: dateStr,
    description: recurring.description,
    isProjected: true,
  };
}

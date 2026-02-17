import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import type { Transaction } from "@/transactions/Transaction.type";

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

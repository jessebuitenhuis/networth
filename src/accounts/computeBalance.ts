import type { Transaction } from "@/transactions/Transaction.type";

export function computeBalance(
  accountId: string,
  transactions: Transaction[],
  asOfDate?: string
): number {
  return transactions
    .filter((t) => t.accountId === accountId && (!asOfDate || t.date <= asOfDate))
    .reduce((sum, t) => sum + t.amount, 0);
}

import type { Transaction } from "@/models/Transaction";

export function computeBalance(
  accountId: string,
  transactions: Transaction[]
): number {
  return transactions
    .filter((t) => t.accountId === accountId)
    .reduce((sum, t) => sum + t.amount, 0);
}

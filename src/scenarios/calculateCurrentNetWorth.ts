import { AccountType } from "@/accounts/AccountType";
import type { Transaction } from "@/transactions/Transaction.type";

export function calculateCurrentNetWorth(
  transactions: Transaction[],
  accountTypes: Map<string, AccountType>,
  today: string
): { currentNetWorth: number; futureTransactions: Transaction[] } {
  let currentNetWorth = 0;
  const futureTransactions: Transaction[] = [];

  for (const tx of transactions) {
    if (!accountTypes.has(tx.accountId)) continue;

    if (tx.date <= today) {
      const type = accountTypes.get(tx.accountId)!;
      currentNetWorth += type === AccountType.Asset ? tx.amount : -tx.amount;
    } else {
      futureTransactions.push(tx);
    }
  }

  return { currentNetWorth, futureTransactions };
}

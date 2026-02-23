import { AccountType } from "@/accounts/AccountType";
import type { Transaction } from "@/transactions/Transaction.type";

export function calcInitialNetWorth(
  transactions: Transaction[],
  accountTypes: Map<string, AccountType>,
  beforeDate: string
): number {
  let netWorth = 0;
  for (const tx of transactions) {
    if (!accountTypes.has(tx.accountId)) continue;
    if (tx.date >= beforeDate) continue;
    const type = accountTypes.get(tx.accountId)!;
    netWorth += type === AccountType.Asset ? tx.amount : -tx.amount;
  }
  return netWorth;
}

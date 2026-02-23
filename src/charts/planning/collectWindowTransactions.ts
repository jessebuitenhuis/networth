import { AccountType } from "@/accounts/AccountType";
import type { Transaction } from "@/transactions/Transaction.type";

export function collectWindowTransactions(
  transactions: Transaction[],
  accountTypes: Map<string, AccountType>,
  startStr: string,
  today: string
): Transaction[] {
  return transactions.filter(
    (tx) => accountTypes.has(tx.accountId) && tx.date >= startStr && tx.date <= today
  );
}

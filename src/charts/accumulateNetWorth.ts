import { AccountType } from "@/accounts/AccountType";
import type { NetWorthDataPoint } from "@/charts/NetWorthDataPoint.type";
import type { Transaction } from "@/transactions/Transaction.type";

export function accumulateNetWorth(
  datePoints: string[],
  sortedTransactions: Transaction[],
  accountTypes: Map<string, AccountType>,
  initialNetWorth: number = 0
): NetWorthDataPoint[] {
  let netWorth = initialNetWorth;
  let txIndex = 0;

  return datePoints.map((date) => {
    while (txIndex < sortedTransactions.length && sortedTransactions[txIndex].date <= date) {
      const tx = sortedTransactions[txIndex];
      const type = accountTypes.get(tx.accountId)!;
      netWorth += type === AccountType.Asset ? tx.amount : -tx.amount;
      txIndex++;
    }
    return { date, netWorth };
  });
}

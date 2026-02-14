import type { Transaction } from "@/models/Transaction.type";

export function generateCompoundGrowthTransactions(
  accountId: string,
  startBalance: number,
  annualReturnRate: number,
  sortedFutureTx: Transaction[],
  datePoints: string[],
  today: string,
): Transaction[] {
  if (startBalance === 0) {
    return [];
  }

  const growthTransactions: Transaction[] = [];
  let balance = startBalance;
  let txIndex = 0;

  for (let i = 0; i < datePoints.length - 1; i++) {
    const currentDate = datePoints[i];
    const nextDate = datePoints[i + 1];

    if (nextDate <= today) {
      continue;
    }

    while (txIndex < sortedFutureTx.length && sortedFutureTx[txIndex].date <= nextDate) {
      balance += sortedFutureTx[txIndex].amount;
      txIndex++;
    }

    const daysBetween = calculateDaysBetween(currentDate, nextDate);
    const growth = balance * (Math.pow(1 + annualReturnRate / 100, daysBetween / 365) - 1);

    growthTransactions.push({
      id: `growth-${accountId}-${nextDate}`,
      accountId,
      amount: growth,
      date: nextDate,
      description: "Expected return",
      isProjected: true,
    });

    balance += growth;
  }

  return growthTransactions;
}

function calculateDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

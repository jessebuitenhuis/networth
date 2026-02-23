import type { Account } from "@/accounts/Account.type";
import { AccountType } from "@/accounts/AccountType";
import { ChartPeriod } from "@/charts/ChartPeriod";
import type { NetWorthDataPoint } from "@/charts/NetWorthDataPoint.type";
import { generateOccurrences } from "@/recurring-transactions/generateOccurrences";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import { generateCompoundGrowthTransactions } from "@/transactions/generateCompoundGrowthTransactions";
import type { Transaction } from "@/transactions/Transaction.type";

import { accumulateNetWorth } from "./accumulateNetWorth";
import { applyInflation } from "./applyInflation";
import { computeDateWindow } from "./computeDateWindow";
import { generatePlanningDatePoints } from "./generatePlanningDatePoints";

function calcInitialNetWorth(
  transactions: Transaction[],
  accountTypes: Map<string, AccountType>,
  beforeDate: string
): number {
  let netWorth = 0;
  for (const tx of transactions) {
    if (!accountTypes.has(tx.accountId)) continue;
    const type = accountTypes.get(tx.accountId)!;
    if (tx.date < beforeDate) {
      netWorth += type === AccountType.Asset ? tx.amount : -tx.amount;
    }
  }
  return netWorth;
}

function collectWindowTransactions(
  transactions: Transaction[],
  accountTypes: Map<string, AccountType>,
  startStr: string,
  today: string
): Transaction[] {
  return transactions.filter(
    (tx) => accountTypes.has(tx.accountId) && tx.date >= startStr && tx.date <= today
  );
}

function collectFutureTransactions(
  transactions: Transaction[],
  accountTypes: Map<string, AccountType>,
  today: string,
  endStr: string,
  recurringTransactions: RecurringTransaction[],
  inflationRate: number,
  accounts: Account[],
  datePoints: string[]
): Transaction[] {
  const futureTx: Transaction[] = [];

  for (const tx of transactions) {
    if (!accountTypes.has(tx.accountId)) continue;
    if (tx.date > today && tx.date <= endStr) futureTx.push(tx);
  }

  for (const rt of recurringTransactions) {
    if (!accountTypes.has(rt.accountId)) continue;
    const occurrences = generateOccurrences(rt, today, endStr);
    for (const occ of occurrences) {
      if (occ.date > today) {
        if (inflationRate > 0)
          occ.amount = applyInflation(occ.amount, today, occ.date, inflationRate);
        futureTx.push(occ);
      }
    }
  }

  const futureDatePoints = datePoints.filter((d) => d > today);
  for (const account of accounts) {
    if (account.expectedReturnRate === undefined) continue;

    let startBalance = 0;
    for (const tx of transactions) {
      if (tx.accountId === account.id && tx.date <= today) startBalance += tx.amount;
    }

    const accountFutureTx = futureTx
      .filter((tx) => tx.accountId === account.id)
      .sort((a, b) => a.date.localeCompare(b.date));

    futureTx.push(
      ...generateCompoundGrowthTransactions(
        account.id,
        startBalance,
        account.expectedReturnRate,
        accountFutureTx,
        futureDatePoints,
        today
      )
    );
  }

  return futureTx;
}

export function computePlanningChartSeries(
  accounts: Account[],
  transactions: Transaction[],
  period: ChartPeriod,
  offset: number,
  today: string,
  recurringTransactions: RecurringTransaction[] = [],
  inflationRate: number = 0
): NetWorthDataPoint[] {
  const todayDate = new Date(today + "T00:00:00");
  const { start, end } = computeDateWindow(period, offset, todayDate);
  const datePoints = generatePlanningDatePoints(start, end, period);

  const accountTypes = new Map<string, AccountType>();
  for (const a of accounts) accountTypes.set(a.id, a.type);

  const startStr = datePoints[0];
  const endStr = datePoints[datePoints.length - 1];

  const initialNetWorth = calcInitialNetWorth(transactions, accountTypes, startStr);

  const windowTx = collectWindowTransactions(transactions, accountTypes, startStr, today);

  const futureTx = collectFutureTransactions(
    transactions, accountTypes, today, endStr,
    recurringTransactions, inflationRate, accounts, datePoints
  );

  const allTx = [...windowTx, ...futureTx].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  return accumulateNetWorth(datePoints, allTx, accountTypes, initialNetWorth);
}

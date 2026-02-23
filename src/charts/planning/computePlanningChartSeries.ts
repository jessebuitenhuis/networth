import type { Account } from "@/accounts/Account.type";
import { AccountType } from "@/accounts/AccountType";
import { ChartPeriod } from "@/charts/ChartPeriod";
import type { NetWorthDataPoint } from "@/charts/NetWorthDataPoint.type";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import type { Transaction } from "@/transactions/Transaction.type";

import { accumulateNetWorth } from "../accumulateNetWorth";
import { calcInitialNetWorth } from "./calcInitialNetWorth";
import { collectFutureTransactions } from "./collectFutureTransactions";
import { collectWindowTransactions } from "./collectWindowTransactions";
import { computeDateWindow } from "./computeDateWindow";
import { generatePlanningDatePoints } from "./generatePlanningDatePoints";

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

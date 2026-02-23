import type { Account } from "@/accounts/Account.type";
import { AccountType } from "@/accounts/AccountType";
import { ChartPeriod } from "@/charts/ChartPeriod";
import type { NetWorthDataPoint } from "@/charts/NetWorthDataPoint.type";
import { shiftDateByPeriod } from "@/charts/shiftDateByPeriod";
import { addDays, endOfMonth, formatDate } from "@/lib/dateUtils";
import { generateOccurrences } from "@/recurring-transactions/generateOccurrences";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import { generateCompoundGrowthTransactions } from "@/transactions/generateCompoundGrowthTransactions";
import type { Transaction } from "@/transactions/Transaction.type";

import { accumulateNetWorth } from "./accumulateNetWorth";
import { applyInflation } from "./applyInflation";

export function computDateWindow(
  period: ChartPeriod,
  offset: number,
  today: Date
): { start: Date; end: Date } {
  return {
    start: shiftDateByPeriod(today, period, offset - 1),
    end: shiftDateByPeriod(today, period, offset + 1),
  };
}

function generatePlanningDatePoints(
  start: Date,
  end: Date,
  period: ChartPeriod
): string[] {
  const dates: string[] = [];

  switch (period) {
    case ChartPeriod.OneWeek:
    case ChartPeriod.OneMonth:
    case ChartPeriod.ThreeMonths:
      for (let d = new Date(start); d <= end; d = addDays(d, 1))
        dates.push(formatDate(d));
      break;
    case ChartPeriod.SixMonths: {
      dates.push(formatDate(start));
      const dayOfWeek = start.getDay();
      const firstSunday =
        dayOfWeek === 0
          ? addDays(start, 7)
          : addDays(start, 7 - dayOfWeek);
      for (let d = firstSunday; d <= end; d = addDays(d, 7))
        dates.push(formatDate(d));
      if (dates[dates.length - 1] !== formatDate(end))
        dates.push(formatDate(end));
      break;
    }
    case ChartPeriod.OneYear: {
      dates.push(formatDate(start));
      for (let m = 0; ; m++) {
        const eom = endOfMonth(
          new Date(start.getFullYear(), start.getMonth() + m, 1)
        );
        if (eom > end) break;
        const eomStr = formatDate(eom);
        if (eomStr > dates[dates.length - 1]) dates.push(eomStr);
      }
      if (dates[dates.length - 1] !== formatDate(end))
        dates.push(formatDate(end));
      break;
    }
    default:
      dates.push(formatDate(start));
      if (formatDate(start) !== formatDate(end)) dates.push(formatDate(end));
      break;
  }

  return dates;
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
  const { start, end } = computDateWindow(period, offset, todayDate);
  const datePoints = generatePlanningDatePoints(start, end, period);

  const accountTypes = new Map<string, AccountType>();
  for (const a of accounts) accountTypes.set(a.id, a.type);

  const startStr = datePoints[0];
  const endStr = datePoints[datePoints.length - 1];

  // Initial net worth from transactions before window start
  let initialNetWorth = 0;
  for (const tx of transactions) {
    if (!accountTypes.has(tx.accountId)) continue;
    const type = accountTypes.get(tx.accountId)!;
    if (tx.date < startStr) {
      initialNetWorth += type === AccountType.Asset ? tx.amount : -tx.amount;
    }
  }

  // Actual transactions within the window (up to today)
  const windowTransactions: Transaction[] = [];
  for (const tx of transactions) {
    if (!accountTypes.has(tx.accountId)) continue;
    if (tx.date >= startStr && tx.date <= today) {
      windowTransactions.push(tx);
    }
  }

  // Future one-off transactions within the window
  const futureTx: Transaction[] = [];
  for (const tx of transactions) {
    if (!accountTypes.has(tx.accountId)) continue;
    if (tx.date > today && tx.date <= endStr) {
      futureTx.push(tx);
    }
  }

  // Recurring transaction occurrences after today
  for (const rt of recurringTransactions) {
    if (!accountTypes.has(rt.accountId)) continue;
    const occurrences = generateOccurrences(rt, today, endStr);
    for (const occ of occurrences) {
      if (occ.date > today) {
        if (inflationRate > 0) {
          occ.amount = applyInflation(occ.amount, today, occ.date, inflationRate);
        }
        futureTx.push(occ);
      }
    }
  }

  // Compound growth for accounts with expected return rates
  const futureDatePoints = datePoints.filter((d) => d > today);
  for (const account of accounts) {
    if (account.expectedReturnRate === undefined) continue;

    let startBalance = 0;
    for (const tx of transactions) {
      if (tx.accountId === account.id && tx.date <= today) {
        startBalance += tx.amount;
      }
    }

    const accountFutureTx = futureTx
      .filter((tx) => tx.accountId === account.id)
      .sort((a, b) => a.date.localeCompare(b.date));

    const growthTx = generateCompoundGrowthTransactions(
      account.id,
      startBalance,
      account.expectedReturnRate,
      accountFutureTx,
      futureDatePoints,
      today
    );

    futureTx.push(...growthTx);
  }

  const allTx = [...windowTransactions, ...futureTx].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  return accumulateNetWorth(datePoints, allTx, accountTypes, initialNetWorth);
}

import type { Account } from "@/models/Account.type";
import { AccountType } from "@/models/AccountType";
import { ChartPeriod } from "@/models/ChartPeriod";
import type { DateRange } from "@/models/DateRange.type";
import type { NetWorthDataPoint } from "@/models/NetWorthDataPoint.type";
import type { RecurringTransaction } from "@/models/RecurringTransaction.type";
import type { Transaction } from "@/models/Transaction.type";
import { addDays, addMonths, endOfMonth, formatDate } from "@/lib/dateUtils";
import { generateOccurrences } from "./generateOccurrences";

function generateProjectedDatePoints(
  period: ChartPeriod,
  today: Date,
  transactions: Transaction[],
  customRange?: DateRange
): string[] {
  const dates: string[] = [];

  switch (period) {
    case ChartPeriod.OneWeek:
      for (let i = 0; i <= 7; i++) dates.push(formatDate(addDays(today, i)));
      break;
    case ChartPeriod.OneMonth:
      for (let i = 0; i <= 30; i++) dates.push(formatDate(addDays(today, i)));
      break;
    case ChartPeriod.ThreeMonths:
      for (let i = 0; i <= 90; i++) dates.push(formatDate(addDays(today, i)));
      break;
    case ChartPeriod.SixMonths: {
      const end = addMonths(today, 6);
      dates.push(formatDate(today));
      const dayOfWeek = today.getDay();
      const firstSunday = dayOfWeek === 0 ? addDays(today, 7) : addDays(today, 7 - dayOfWeek);
      for (let d = firstSunday; d <= end; d = addDays(d, 7))
        dates.push(formatDate(d));
      if (dates[dates.length - 1] !== formatDate(end))
        dates.push(formatDate(end));
      break;
    }
    case ChartPeriod.OneYear: {
      dates.push(formatDate(today));
      for (let m = 0; m < 12; m++) {
        const eom = endOfMonth(new Date(today.getFullYear(), today.getMonth() + m, 1));
        const eomStr = formatDate(eom);
        if (eomStr !== dates[dates.length - 1])
          dates.push(eomStr);
      }
      break;
    }
    case ChartPeriod.All: {
      const futureDates = transactions
        .map((t) => t.date)
        .filter((d) => d > formatDate(today))
        .sort((a, b) => a.localeCompare(b));
      const end =
        futureDates.length > 0
          ? new Date(futureDates[futureDates.length - 1] + "T00:00:00")
          : addMonths(today, 12);
      dates.push(formatDate(today));
      for (let m = 0; ; m++) {
        const eom = endOfMonth(new Date(today.getFullYear(), today.getMonth() + m, 1));
        if (eom > end) break;
        const eomStr = formatDate(eom);
        if (eomStr !== dates[dates.length - 1])
          dates.push(eomStr);
      }
      if (dates[dates.length - 1] !== formatDate(end))
        dates.push(formatDate(end));
      break;
    }
    case ChartPeriod.Custom: {
      if (!customRange) return [formatDate(today)];
      const start = new Date(customRange.start + "T00:00:00");
      const end = new Date(customRange.end + "T00:00:00");
      for (let d = start; d <= end; d = addDays(d, 1)) dates.push(formatDate(d));
      break;
    }
  }

  return dates;
}

export function computeProjectedSeries(
  accounts: Account[],
  transactions: Transaction[],
  period: ChartPeriod,
  today: string = formatDate(new Date()),
  customRange?: DateRange,
  recurringTransactions: RecurringTransaction[] = []
): NetWorthDataPoint[] {
  const todayDate = new Date(today + "T00:00:00");
  const datePoints = generateProjectedDatePoints(period, todayDate, transactions, customRange);

  const accountTypes = new Map<string, AccountType>();
  for (const a of accounts) accountTypes.set(a.id, a.type);

  let netWorth = 0;
  const futureTx: Transaction[] = [];

  for (const tx of transactions) {
    if (!accountTypes.has(tx.accountId)) continue;
    const type = accountTypes.get(tx.accountId)!;
    if (tx.date <= today) {
      netWorth += type === AccountType.Asset ? tx.amount : -tx.amount;
    } else {
      futureTx.push(tx);
    }
  }

  const rangeEnd = datePoints[datePoints.length - 1];
  for (const rt of recurringTransactions) {
    if (!accountTypes.has(rt.accountId)) continue;
    const occurrences = generateOccurrences(rt, today, rangeEnd);
    for (const occ of occurrences) {
      if (occ.date > today) {
        futureTx.push(occ);
      }
    }
  }

  futureTx.sort((a, b) => a.date.localeCompare(b.date));

  let txIndex = 0;

  return datePoints.map((date) => {
    while (txIndex < futureTx.length && futureTx[txIndex].date <= date) {
      const tx = futureTx[txIndex];
      const type = accountTypes.get(tx.accountId)!;
      netWorth += type === AccountType.Asset ? tx.amount : -tx.amount;
      txIndex++;
    }
    return { date, netWorth };
  });
}

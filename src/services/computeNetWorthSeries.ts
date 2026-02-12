import type { Account } from "@/models/Account";
import { AccountType } from "@/models/AccountType";
import { ChartPeriod } from "@/models/ChartPeriod";
import type { DateRange } from "@/models/DateRange";
import type { NetWorthDataPoint } from "@/models/NetWorthDataPoint";
import type { Transaction } from "@/models/Transaction";
import { addDays, addMonths, endOfMonth, formatDate, toSunday } from "@/lib/dateUtils";

function generateDatePoints(
  period: ChartPeriod,
  today: Date,
  transactions: Transaction[] = [],
  customRange?: DateRange
): string[] {
  const dates: string[] = [];

  switch (period) {
    case ChartPeriod.OneWeek:
      for (let i = 7; i >= 0; i--) dates.push(formatDate(addDays(today, -i)));
      break;
    case ChartPeriod.MTD: {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      for (let d = start; d <= today; d = addDays(d, 1))
        dates.push(formatDate(d));
      break;
    }
    case ChartPeriod.OneMonth:
      for (let i = 30; i >= 0; i--) dates.push(formatDate(addDays(today, -i)));
      break;
    case ChartPeriod.ThreeMonths: {
      const start = toSunday(addDays(today, -90));
      for (let d = start; d <= today; d = addDays(d, 7))
        dates.push(formatDate(d));
      if (dates[dates.length - 1] !== formatDate(today))
        dates.push(formatDate(today));
      break;
    }
    case ChartPeriod.SixMonths: {
      const start = toSunday(addDays(today, -180));
      for (let d = start; d <= today; d = addDays(d, 7))
        dates.push(formatDate(d));
      if (dates[dates.length - 1] !== formatDate(today))
        dates.push(formatDate(today));
      break;
    }
    case ChartPeriod.YTD: {
      const jan1 = new Date(today.getFullYear(), 0, 1);
      const day = jan1.getDay();
      const start = day === 0 ? jan1 : addDays(jan1, 7 - day);
      for (let d = start; d <= today; d = addDays(d, 7))
        dates.push(formatDate(d));
      if (dates[dates.length - 1] !== formatDate(today))
        dates.push(formatDate(today));
      break;
    }
    case ChartPeriod.OneYear: {
      for (let m = -12; m < 0; m++) {
        const eom = endOfMonth(new Date(today.getFullYear(), today.getMonth() + m, 1));
        dates.push(formatDate(eom));
      }
      dates.push(formatDate(today));
      break;
    }
    case ChartPeriod.All: {
      const txDates = transactions
        .map((t) => t.date)
        .sort((a, b) => a.localeCompare(b));
      const earliest = txDates.length > 0
        ? new Date(txDates[0] + "T00:00:00")
        : addMonths(today, -12);
      const totalDays = Math.floor(
        (today.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (totalDays <= 180) {
        const start = toSunday(earliest);
        for (let d = start; d <= today; d = addDays(d, 7))
          dates.push(formatDate(d));
      } else {
        const startMonth = new Date(earliest.getFullYear(), earliest.getMonth(), 1);
        for (let m = startMonth; m < today; m = new Date(m.getFullYear(), m.getMonth() + 1, 1))
          dates.push(formatDate(endOfMonth(m)));
      }
      if (dates[dates.length - 1] !== formatDate(today))
        dates.push(formatDate(today));
      break;
    }
    case ChartPeriod.Custom: {
      if (!customRange) return [formatDate(today)];
      const start = new Date(customRange.start + "T00:00:00");
      const end = new Date(customRange.end + "T00:00:00");
      for (let d = start; d <= end; d = addDays(d, 1))
        dates.push(formatDate(d));
      break;
    }
  }

  return dates;
}

export function computeNetWorthSeries(
  accounts: Account[],
  transactions: Transaction[],
  period: ChartPeriod,
  today: string = formatDate(new Date()),
  customRange?: DateRange
): NetWorthDataPoint[] {
  const todayDate = new Date(today + "T00:00:00");
  const datePoints = generateDatePoints(period, todayDate, transactions, customRange);

  const accountTypes = new Map<string, AccountType>();
  for (const a of accounts) accountTypes.set(a.id, a.type);

  const sorted = [...transactions]
    .filter((t) => accountTypes.has(t.accountId))
    .sort((a, b) => a.date.localeCompare(b.date));

  let netWorth = 0;
  let txIndex = 0;

  return datePoints.map((date) => {
    while (txIndex < sorted.length && sorted[txIndex].date <= date) {
      const tx = sorted[txIndex];
      const type = accountTypes.get(tx.accountId)!;
      netWorth += type === AccountType.Asset ? tx.amount : -tx.amount;
      txIndex++;
    }
    return { date, netWorth };
  });
}

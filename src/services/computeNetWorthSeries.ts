import type { Account } from "@/models/Account";
import { AccountType } from "@/models/AccountType";
import { ChartPeriod } from "@/models/ChartPeriod";
import type { NetWorthDataPoint } from "@/models/NetWorthDataPoint";
import type { Transaction } from "@/models/Transaction";

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const targetMonth = result.getMonth() + months;
  result.setMonth(targetMonth);
  // Clamp: if JS overflowed to next month, go back to last day of target month
  if (result.getMonth() !== ((targetMonth % 12) + 12) % 12) {
    result.setDate(0);
  }
  return result;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function generateDatePoints(period: ChartPeriod, today: Date): string[] {
  const dates: string[] = [];

  switch (period) {
    case ChartPeriod.Week:
      for (let i = 7; i >= 0; i--) dates.push(formatDate(addDays(today, -i)));
      break;
    case ChartPeriod.Month:
      for (let i = 30; i >= 0; i--) dates.push(formatDate(addDays(today, -i)));
      break;
    case ChartPeriod.Quarter: {
      const start = addDays(today, -90);
      for (let d = start; d <= today; d = addDays(d, 7))
        dates.push(formatDate(d));
      if (dates[dates.length - 1] !== formatDate(today))
        dates.push(formatDate(today));
      break;
    }
    case ChartPeriod.Year: {
      const start = addMonths(today, -12);
      for (let d = start; d <= today; d = addMonths(d, 1))
        dates.push(formatDate(d));
      if (dates[dates.length - 1] !== formatDate(today))
        dates.push(formatDate(today));
      break;
    }
  }

  return dates;
}

export function computeNetWorthSeries(
  accounts: Account[],
  transactions: Transaction[],
  period: ChartPeriod,
  today: string = formatDate(new Date())
): NetWorthDataPoint[] {
  const todayDate = new Date(today + "T00:00:00");
  const datePoints = generateDatePoints(period, todayDate);

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

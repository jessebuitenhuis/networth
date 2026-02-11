import type { Account } from "@/models/Account";
import { AccountType } from "@/models/AccountType";
import type { NetWorthDataPoint } from "@/models/NetWorthDataPoint";
import { ProjectionPeriod } from "@/models/ProjectionPeriod";
import type { Transaction } from "@/models/Transaction";
import { addDays, addMonths, formatDate } from "@/lib/dateUtils";

function generateProjectedDatePoints(
  period: ProjectionPeriod,
  today: Date,
  customRange?: { start: string; end: string }
): string[] {
  const dates: string[] = [];

  switch (period) {
    case ProjectionPeriod.OneMonth:
      for (let i = 0; i <= 30; i++) dates.push(formatDate(addDays(today, i)));
      break;
    case ProjectionPeriod.ThreeMonths:
      for (let i = 0; i <= 90; i++) dates.push(formatDate(addDays(today, i)));
      break;
    case ProjectionPeriod.SixMonths: {
      const end = addMonths(today, 6);
      for (let d = today; d <= end; d = addDays(d, 7)) dates.push(formatDate(d));
      if (dates[dates.length - 1] !== formatDate(end)) dates.push(formatDate(end));
      break;
    }
    case ProjectionPeriod.OneYear: {
      for (let i = 0; i <= 12; i++) dates.push(formatDate(addMonths(today, i)));
      break;
    }
    case ProjectionPeriod.Custom: {
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
  period: ProjectionPeriod,
  today: string = formatDate(new Date()),
  customRange?: { start: string; end: string }
): NetWorthDataPoint[] {
  const todayDate = new Date(today + "T00:00:00");
  const datePoints = generateProjectedDatePoints(period, todayDate, customRange);

  const accountTypes = new Map<string, AccountType>();
  for (const a of accounts) accountTypes.set(a.id, a.type);

  // Compute starting net worth from all transactions up to today
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

  // Sort future transactions by date for accumulation
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

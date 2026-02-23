import type { Account } from "@/accounts/Account.type";
import { ChartPeriod } from "@/charts/ChartPeriod";
import { computeProjectedSeries } from "@/charts/computeProjectedSeries";
import type { DateRange } from "@/charts/DateRange.type";
import type { NetWorthDataPoint } from "@/charts/NetWorthDataPoint.type";
import { computePlanningChartSeries } from "@/charts/planning/computePlanningChartSeries";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import type { Transaction } from "@/transactions/Transaction.type";

export function computeChartSeries(
  accounts: Account[],
  transactions: Transaction[],
  recurringTransactions: RecurringTransaction[],
  period: ChartPeriod,
  offset: number,
  today: string,
  customRange: DateRange,
  isNavigable: boolean,
  inflationRate: number
): NetWorthDataPoint[] {
  if (isNavigable) {
    return computePlanningChartSeries(
      accounts, transactions, period, offset, today,
      recurringTransactions, inflationRate
    );
  }
  return computeProjectedSeries(
    accounts, transactions, period, today,
    period === ChartPeriod.Custom ? customRange : undefined,
    recurringTransactions, inflationRate
  );
}

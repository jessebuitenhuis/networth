import { ChartPeriod } from "@/charts/ChartPeriod";

const NAVIGABLE_PERIODS = new Set([
  ChartPeriod.OneWeek,
  ChartPeriod.OneMonth,
  ChartPeriod.ThreeMonths,
  ChartPeriod.SixMonths,
  ChartPeriod.OneYear,
]);

export function isNavigablePeriod(period: ChartPeriod): boolean {
  return NAVIGABLE_PERIODS.has(period);
}

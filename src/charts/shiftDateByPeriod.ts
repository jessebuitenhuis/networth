import { ChartPeriod } from "@/charts/ChartPeriod";
import { addDays, addMonths, addYears } from "@/lib/dateUtils";

export function shiftDateByPeriod(
  date: Date,
  period: ChartPeriod,
  steps: number
): Date {
  switch (period) {
    case ChartPeriod.OneWeek:
      return addDays(date, steps * 7);
    case ChartPeriod.OneMonth:
      return addMonths(date, steps);
    case ChartPeriod.ThreeMonths:
      return addMonths(date, steps * 3);
    case ChartPeriod.SixMonths:
      return addMonths(date, steps * 6);
    case ChartPeriod.OneYear:
      return addYears(date, steps);
    default:
      return date;
  }
}

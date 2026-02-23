import { ChartPeriod } from "@/charts/ChartPeriod";
import { shiftDateByPeriod } from "@/charts/shiftDateByPeriod";

export function computeDateWindow(
  period: ChartPeriod,
  offset: number,
  today: Date
): { start: Date; end: Date } {
  return {
    start: shiftDateByPeriod(today, period, offset - 1),
    end: shiftDateByPeriod(today, period, offset + 1),
  };
}

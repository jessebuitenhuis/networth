import { ChartPeriod } from "@/charts/ChartPeriod";
import { addDays, endOfMonth, formatDate } from "@/lib/dateUtils";

type DatePointStrategy = (start: Date, end: Date) => string[];

function generateDailyPoints(start: Date, end: Date): string[] {
  const dates: string[] = [];
  for (let d = new Date(start); d <= end; d = addDays(d, 1))
    dates.push(formatDate(d));
  return dates;
}

function generateWeeklyPoints(start: Date, end: Date): string[] {
  const dates = [formatDate(start)];
  const dayOfWeek = start.getDay();
  const firstSunday = dayOfWeek === 0 ? addDays(start, 7) : addDays(start, 7 - dayOfWeek);
  for (let d = firstSunday; d <= end; d = addDays(d, 7))
    dates.push(formatDate(d));
  if (dates[dates.length - 1] !== formatDate(end))
    dates.push(formatDate(end));
  return dates;
}

function generateMonthlyPoints(start: Date, end: Date): string[] {
  const dates = [formatDate(start)];
  for (let m = 0; ; m++) {
    const eom = endOfMonth(new Date(start.getFullYear(), start.getMonth() + m, 1));
    if (eom > end) break;
    const eomStr = formatDate(eom);
    if (eomStr > dates[dates.length - 1]) dates.push(eomStr);
  }
  if (dates[dates.length - 1] !== formatDate(end))
    dates.push(formatDate(end));
  return dates;
}

function generateEndpointPoints(start: Date, end: Date): string[] {
  const dates = [formatDate(start)];
  if (formatDate(start) !== formatDate(end)) dates.push(formatDate(end));
  return dates;
}

const DATE_POINT_STRATEGIES: Record<string, DatePointStrategy> = {
  [ChartPeriod.OneWeek]: generateDailyPoints,
  [ChartPeriod.OneMonth]: generateDailyPoints,
  [ChartPeriod.ThreeMonths]: generateDailyPoints,
  [ChartPeriod.SixMonths]: generateWeeklyPoints,
  [ChartPeriod.OneYear]: generateMonthlyPoints,
};

export function generatePlanningDatePoints(
  start: Date,
  end: Date,
  period: ChartPeriod
): string[] {
  const strategy = DATE_POINT_STRATEGIES[period] ?? generateEndpointPoints;
  return strategy(start, end);
}

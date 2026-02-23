import { ChartPeriod } from "@/charts/ChartPeriod";
import { addDays, endOfMonth, formatDate } from "@/lib/dateUtils";

export function generatePlanningDatePoints(
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

import { ChartPeriod } from "@/models/ChartPeriod";

export type TickFormat = "weekday" | "dayMonth" | "monthYear";

export function getTickFormat(
  period: ChartPeriod,
  data?: { date: string }[]
): TickFormat {
  switch (period) {
    case ChartPeriod.OneWeek:
      return "weekday";
    case ChartPeriod.MTD:
    case ChartPeriod.OneMonth:
    case ChartPeriod.ThreeMonths:
    case ChartPeriod.SixMonths:
    case ChartPeriod.YTD:
    case ChartPeriod.Custom:
      return "dayMonth";
    case ChartPeriod.OneYear:
      return "monthYear";
    case ChartPeriod.All: {
      if (data && data.length >= 2) {
        const d1 = new Date(data[0].date + "T00:00:00");
        const d2 = new Date(data[1].date + "T00:00:00");
        const gap = (d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
        return gap > 20 ? "monthYear" : "dayMonth";
      }
      return "monthYear";
    }
  }
}

export function formatTick(dateStr: string, format: TickFormat): string {
  const date = new Date(dateStr + "T00:00:00");
  switch (format) {
    case "weekday":
      return date.toLocaleDateString(undefined, { weekday: "short" });
    case "dayMonth":
      return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
    case "monthYear":
      return date.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
  }
}

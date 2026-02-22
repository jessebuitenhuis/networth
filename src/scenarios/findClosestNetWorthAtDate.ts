import type { NetWorthDataPoint } from "@/charts/NetWorthDataPoint.type";

export function findClosestNetWorthAtDate(
  sortedSeries: NetWorthDataPoint[],
  targetDate: string
): number {
  let closest = sortedSeries[0];
  for (const point of sortedSeries) {
    if (point.date <= targetDate) {
      closest = point;
    } else {
      break;
    }
  }
  return closest?.netWorth ?? 0;
}

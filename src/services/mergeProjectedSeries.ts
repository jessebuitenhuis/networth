import type { MultiSeriesDataPoint } from "@/models/MultiSeriesDataPoint.type";
import type { NetWorthDataPoint } from "@/models/NetWorthDataPoint.type";

export function mergeProjectedSeries(
  seriesMap: Map<string, NetWorthDataPoint[]>
): MultiSeriesDataPoint[] {
  if (seriesMap.size === 0) {
    return [];
  }

  const firstSeries = Array.from(seriesMap.values())[0];
  if (!firstSeries || firstSeries.length === 0) {
    return [];
  }

  const result: MultiSeriesDataPoint[] = [];

  for (let i = 0; i < firstSeries.length; i++) {
    const point: MultiSeriesDataPoint = {
      date: firstSeries[i].date,
    };

    for (const [seriesKey, dataPoints] of seriesMap.entries()) {
      point[seriesKey] = dataPoints[i].netWorth;
    }

    result.push(point);
  }

  return result;
}

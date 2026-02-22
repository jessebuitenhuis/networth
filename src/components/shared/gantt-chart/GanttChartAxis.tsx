type GanttChartAxisProps = {
  startYear: number;
  endYear: number;
  totalMs: number;
  boundsStartMs: number;
};

export function GanttChartAxis({
  startYear,
  endYear,
  totalMs,
  boundsStartMs,
}: GanttChartAxisProps) {
  const years: number[] = [];
  for (let y = startYear; y <= endYear; y++) {
    years.push(y);
  }

  return (
    <div className="relative h-6 border-b text-xs text-muted-foreground">
      {years.map((year) => {
        const yearMs = new Date(year, 0, 1).getTime() - boundsStartMs;
        const leftPercent = (yearMs / totalMs) * 100;
        return (
          <span
            key={year}
            className="absolute -translate-x-1/2"
            style={{ left: `${leftPercent}%` }}
          >
            {year}
          </span>
        );
      })}
    </div>
  );
}

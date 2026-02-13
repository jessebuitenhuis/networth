type ScenarioLegendEntry = {
  name: string;
  color: string;
  isDashed: boolean;
};

type ScenarioLegendProps = {
  entries: ScenarioLegendEntry[];
};

export function ScenarioLegend({ entries }: ScenarioLegendProps) {
  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {entries.map((entry) => (
        <div key={entry.name} className="flex items-center gap-1.5 text-sm">
          <span
            data-testid="legend-indicator"
            className={`inline-block h-0 w-4 border-t-2 ${entry.isDashed ? "dashed" : ""}`}
            style={{
              borderColor: entry.color,
              borderStyle: entry.isDashed ? "dashed" : "solid",
            }}
          />
          <span>{entry.name}</span>
        </div>
      ))}
    </div>
  );
}

import type { CSSProperties } from "react";

type ScenarioLegendEntry = {
  name: string;
  color: string;
  lineStyle: "solid" | "dashed" | "dotted";
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
            className="scenario-indicator inline-block h-0 w-4 border-t-2"
            style={
              {
                "--indicator-color": entry.color,
                "--indicator-style": entry.lineStyle,
              } as CSSProperties
            }
          />
          <span>{entry.name}</span>
        </div>
      ))}
    </div>
  );
}

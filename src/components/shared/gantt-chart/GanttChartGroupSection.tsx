import { GanttChartBar } from "./GanttChartBar";
import type { GanttChartGroup } from "./GanttChartGroup.type";

type GanttChartGroupSectionProps = {
  group: GanttChartGroup;
  totalMs: number;
  boundsStartMs: number;
  boundsEndMs: number;
};

export function GanttChartGroupSection({
  group,
  totalMs,
  boundsStartMs,
  boundsEndMs,
}: GanttChartGroupSectionProps) {
  return (
    <div className="mb-4">
      <div className="text-sm font-semibold text-foreground mb-1">
        {group.label}
      </div>
      {group.items.map((item) => (
        <GanttChartBar
          key={item.id}
          item={item}
          totalMs={totalMs}
          boundsStartMs={boundsStartMs}
          boundsEndMs={boundsEndMs}
        />
      ))}
    </div>
  );
}

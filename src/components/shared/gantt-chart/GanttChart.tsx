"use client";

import { useState } from "react";

import { GanttChartAxis } from "./GanttChartAxis";
import type { GanttChartGroup } from "./GanttChartGroup.type";
import { GanttChartGroupSection } from "./GanttChartGroupSection";

type GanttChartProps = {
  groups: GanttChartGroup[];
  todayDate?: string;
};

export function GanttChart({ groups, todayDate }: GanttChartProps) {
  const [nowMs] = useState(() => Date.now());
  const allItems = groups.flatMap((g) => g.items);

  if (allItems.length === 0) {
    return null;
  }

  const startDates = allItems.map((item) => new Date(item.startDate).getTime());
  const endDates = allItems.map((item) =>
    item.endDate ? new Date(item.endDate).getTime() : nowMs
  );

  const minMs = Math.min(...startDates);
  const maxMs = Math.max(...endDates);

  const padding = (maxMs - minMs) * 0.05 || 86400000;
  const boundsStartMs = minMs - padding;
  const boundsEndMs = maxMs + padding;
  const totalMs = boundsEndMs - boundsStartMs;

  const startYear = new Date(boundsStartMs).getFullYear();
  const endYear = new Date(boundsEndMs).getFullYear() + 1;

  const todayMs = todayDate
    ? new Date(todayDate).getTime()
    : nowMs;
  const todayPercent = ((todayMs - boundsStartMs) / totalMs) * 100;
  const showToday = todayPercent > 0 && todayPercent < 100;

  return (
    <div className="overflow-x-auto">
      <div className="relative min-w-[800px]">
        <GanttChartAxis
          startYear={startYear}
          endYear={endYear}
          totalMs={totalMs}
          boundsStartMs={boundsStartMs}
        />
        <div className="relative pt-2">
          {showToday && (
            <div
              className="absolute top-0 bottom-0 w-px border-l border-dashed border-muted-foreground/50 z-10"
              style={{ left: `${todayPercent}%` }}
            />
          )}
          {groups.map((group) => (
            <GanttChartGroupSection
              key={group.id}
              group={group}
              totalMs={totalMs}
              boundsStartMs={boundsStartMs}
              boundsEndMs={boundsEndMs}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

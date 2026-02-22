"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { GanttChartItem } from "./GanttChartItem.type";

type GanttChartBarProps = {
  item: GanttChartItem;
  totalMs: number;
  boundsStartMs: number;
  boundsEndMs: number;
};

export function GanttChartBar({
  item,
  totalMs,
  boundsStartMs,
  boundsEndMs,
}: GanttChartBarProps) {
  const startMs = new Date(item.startDate).getTime();
  const endMs = item.endDate ? new Date(item.endDate).getTime() : boundsEndMs;

  const leftPercent = ((startMs - boundsStartMs) / totalMs) * 100;
  const widthPercent = ((endMs - startMs) / totalMs) * 100;

  const isOngoing = !item.endDate;

  const bgColor =
    item.color === "green"
      ? "bg-green-500/80"
      : "bg-red-500/80";

  const borderStyle = item.dashed ? "border-dashed" : "border-solid";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="relative h-7 my-0.5"
            style={{ marginLeft: `${leftPercent}%`, width: `${widthPercent}%` }}
          >
            <div
              className={`absolute inset-0 rounded ${bgColor} border ${borderStyle} border-current/20 flex items-center px-2 overflow-hidden`}
            >
              <span className="text-xs text-white truncate font-medium">
                {item.label}
              </span>
            </div>
            {isOngoing && (
              <div className="absolute inset-y-0 right-0 w-12 rounded-r bg-gradient-to-r from-transparent to-background" />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {item.tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

import type { ReactNode } from "react";

export type GanttChartItem = {
  id: string;
  label: string;
  startDate: string;
  endDate: string | null;
  color: "green" | "red";
  dashed?: boolean;
  tooltipContent: ReactNode;
};

import type { GanttChartItem } from "./GanttChartItem.type";

export type GanttChartGroup = {
  id: string;
  label: string;
  items: GanttChartItem[];
};

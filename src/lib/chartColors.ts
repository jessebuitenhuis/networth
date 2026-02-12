export const CHART_COLORS = [
  "#3b82f6", // blue-500
  "#ef4444", // red-500
  "#22c55e", // green-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#f97316", // orange-500
  "#14b8a6", // teal-500
  "#6366f1", // indigo-500
];

export function getAccountColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

export function getScenarioColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

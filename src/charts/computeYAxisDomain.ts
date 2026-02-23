import type { Goal } from "@/goals/Goal.type";

export function computeYAxisDomain(
  data: Record<string, unknown>[],
  goals: Goal[]
): [number, number] {
  const maxGoalAmount = goals.length > 0 ? Math.max(...goals.map((g) => g.targetAmount)) : 0;
  const maxDataValue = data.reduce((max, point) => {
    const values = Object.values(point).filter((v) => typeof v === "number");
    return Math.max(max, ...values);
  }, 0);
  const minDataValue = data.reduce((min, point) => {
    const values = Object.values(point).filter((v) => typeof v === "number");
    return Math.min(min, ...values);
  }, 0);
  return [Math.min(0, minDataValue), Math.max(maxDataValue, maxGoalAmount)];
}

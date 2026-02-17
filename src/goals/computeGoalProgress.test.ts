import { describe, expect, it } from "vitest";

import type { NetWorthDataPoint } from "@/charts/NetWorthDataPoint.type";
import type { Goal } from "@/goals/Goal.type";
import type { GoalProgress } from "@/goals/GoalProgress.type";
import { addMonths, formatDate } from "@/lib/dateUtils";

import { computeGoalProgress } from "./computeGoalProgress";

describe("computeGoalProgress", () => {
  const today = "2024-01-01";

  it("returns empty array when there are no goals", () => {
    const result = computeGoalProgress([], 0, [], today);
    expect(result).toEqual([]);
  });

  it("returns 0% when current net worth is 0", () => {
    const goals: Goal[] = [
      { id: "1", name: "Goal 1", targetAmount: 10000 },
    ];
    const result = computeGoalProgress(goals, 0, [], today);
    expect(result).toHaveLength(1);
    expect(result[0].percentage).toBe(0);
  });

  it("calculates correct percentage for partial progress", () => {
    const goals: Goal[] = [
      { id: "1", name: "Goal 1", targetAmount: 10000 },
    ];
    const result = computeGoalProgress(goals, 2500, [], today);
    expect(result[0].percentage).toBe(25);
  });

  it("returns 100% when net worth exceeds target", () => {
    const goals: Goal[] = [
      { id: "1", name: "Goal 1", targetAmount: 10000 },
    ];
    const result = computeGoalProgress(goals, 15000, [], today);
    expect(result[0].percentage).toBe(100);
    expect(result[0].isAchieved).toBe(true);
    expect(result[0].timeEstimate).toBe("Achieved!");
  });

  it("returns 0% for negative net worth", () => {
    const goals: Goal[] = [
      { id: "1", name: "Goal 1", targetAmount: 10000 },
    ];
    const result = computeGoalProgress(goals, -5000, [], today);
    expect(result[0].percentage).toBe(0);
  });

  it("returns 0% when target amount is 0 or negative", () => {
    const goals: Goal[] = [
      { id: "1", name: "Goal 1", targetAmount: 0 },
      { id: "2", name: "Goal 2", targetAmount: -100 },
    ];
    const result = computeGoalProgress(goals, 5000, [], today);
    expect(result[0].percentage).toBe(0);
    expect(result[1].percentage).toBe(0);
  });

  it("finds projected achievement date from series", () => {
    const goals: Goal[] = [
      { id: "1", name: "Goal 1", targetAmount: 10000 },
    ];
    const series: NetWorthDataPoint[] = [
      { date: "2024-01-01", netWorth: 2000 },
      { date: "2024-06-01", netWorth: 5000 },
      { date: "2025-01-01", netWorth: 12000 },
    ];
    const result = computeGoalProgress(goals, 2000, series, today);
    expect(result[0].percentage).toBe(20);
    expect(result[0].timeEstimate).toBe("1 year to go");
    expect(result[0].isAchieved).toBe(false);
  });

  it("returns 'Not projected within 50 years' when series never crosses target", () => {
    const goals: Goal[] = [
      { id: "1", name: "Goal 1", targetAmount: 100000 },
    ];
    const series: NetWorthDataPoint[] = [
      { date: "2024-01-01", netWorth: 2000 },
      { date: "2074-01-01", netWorth: 50000 },
    ];
    const result = computeGoalProgress(goals, 2000, series, today);
    expect(result[0].percentage).toBe(2);
    expect(result[0].timeEstimate).toBe("Not projected within 50 years");
  });

  it("handles multiple goals with different progress levels", () => {
    const goals: Goal[] = [
      { id: "1", name: "Already achieved", targetAmount: 5000 },
      { id: "2", name: "Halfway there", targetAmount: 10000 },
      { id: "3", name: "Just started", targetAmount: 50000 },
    ];
    const series: NetWorthDataPoint[] = [
      { date: "2024-01-01", netWorth: 6000 },
      { date: "2025-01-01", netWorth: 12000 },
    ];
    const result = computeGoalProgress(goals, 6000, series, today);

    expect(result[0].goalName).toBe("Already achieved");
    expect(result[0].percentage).toBe(100);
    expect(result[0].isAchieved).toBe(true);
    expect(result[0].timeEstimate).toBe("Achieved!");

    expect(result[1].goalName).toBe("Halfway there");
    expect(result[1].percentage).toBe(60);
    expect(result[1].isAchieved).toBe(false);
    expect(result[1].timeEstimate).toBe("1 year to go");

    expect(result[2].goalName).toBe("Just started");
    expect(result[2].percentage).toBe(12);
    expect(result[2].isAchieved).toBe(false);
    expect(result[2].timeEstimate).toBe("Not projected within 50 years");
  });

  describe("time formatting", () => {
    it.each([
      { months: 36, expected: "3 years to go" },
      { months: 24, expected: "2 years to go" },
      { months: 18, expected: "1 year to go" },
      { months: 12, expected: "1 year to go" },
      { months: 11, expected: "11 months to go" },
      { months: 5, expected: "5 months to go" },
      { months: 2, expected: "2 months to go" },
      { months: 1, expected: "1 month to go" },
      { months: 0, expected: "Less than a month to go" },
    ])("formats $months months as '$expected'", ({ months, expected }) => {
      const goals: Goal[] = [
        { id: "1", name: "Goal", targetAmount: 10000 },
      ];
      const todayDate = new Date("2024-01-01T00:00:00");
      const targetDate = addMonths(todayDate, months);
      const targetDateStr = formatDate(targetDate);
      const series: NetWorthDataPoint[] = [
        { date: "2024-01-01", netWorth: 5000 },
        { date: targetDateStr, netWorth: 10000 },
      ];
      const result = computeGoalProgress(goals, 5000, series, "2024-01-01");
      expect(result[0].timeEstimate).toBe(expected);
    });
  });

  it("includes all goal properties in result", () => {
    const goals: Goal[] = [
      { id: "goal-123", name: "My Goal", targetAmount: 10000 },
    ];
    const result = computeGoalProgress(goals, 5000, [], today);

    const expected: GoalProgress = {
      goalId: "goal-123",
      goalName: "My Goal",
      targetAmount: 10000,
      percentage: 50,
      timeEstimate: "Not projected within 50 years",
      isAchieved: false,
    };
    expect(result[0]).toEqual(expected);
  });
});

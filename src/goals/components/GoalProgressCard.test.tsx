import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { GoalProgress } from "@/goals/GoalProgress.type";

import { GoalProgressCard } from "./GoalProgressCard";
import { GoalProgressCardPage } from "./GoalProgressCard.page";

describe("GoalProgressCard", () => {
  const mockProgress: GoalProgress = {
    goalId: "1",
    goalName: "Retirement Fund",
    targetAmount: 100000,
    percentage: 45,
    timeEstimate: "5 years to go",
    isAchieved: false,
  };

  it("displays goal name", () => {
    const page = GoalProgressCardPage.render({ progress: mockProgress, colorIndex: 0 });
    expect(page.getByText("Retirement Fund")).toBeInTheDocument();
  });

  it("displays percentage complete", () => {
    const page = GoalProgressCardPage.render({ progress: mockProgress, colorIndex: 0 });
    expect(page.getByText("45% complete")).toBeInTheDocument();
  });

  it("displays time estimate", () => {
    const page = GoalProgressCardPage.render({ progress: mockProgress, colorIndex: 0 });
    expect(page.getByText("5 years to go")).toBeInTheDocument();
  });

  it("renders progress bar with correct value", () => {
    const page = GoalProgressCardPage.render({ progress: mockProgress, colorIndex: 0 });
    expect(page.progressBar).toHaveAttribute("aria-valuenow", "45");
  });

  it("applies goal color to title", () => {
    const page = GoalProgressCardPage.render({ progress: mockProgress, colorIndex: 0 });
    const title = page.getByText("Retirement Fund");
    expect(title).toHaveStyle({ color: "#f59e0b" });
  });

  it("shows 'Achieved!' for achieved goals", () => {
    const achievedProgress: GoalProgress = {
      ...mockProgress,
      percentage: 100,
      isAchieved: true,
      timeEstimate: "Achieved!",
    };
    const page = GoalProgressCardPage.render({ progress: achievedProgress, colorIndex: 0 });
    expect(page.getByText("Achieved!")).toBeInTheDocument();
    expect(page.getByText("100% complete")).toBeInTheDocument();
  });

  it("uses different colors for different indices", () => {
    const { rerender } = render(<GoalProgressCard progress={mockProgress} colorIndex={1} />);
    const title1 = screen.getByText("Retirement Fund");
    expect(title1).toHaveStyle({ color: "#10b981" });

    rerender(<GoalProgressCard progress={mockProgress} colorIndex={2} />);
    const title2 = screen.getByText("Retirement Fund");
    expect(title2).toHaveStyle({ color: "#f43f5e" });
  });
});

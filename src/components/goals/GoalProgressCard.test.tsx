import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { GoalProgress } from "@/models/GoalProgress.type";

import { GoalProgressCard } from "./GoalProgressCard";

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
    render(<GoalProgressCard progress={mockProgress} colorIndex={0} />);
    expect(screen.getByText("Retirement Fund")).toBeInTheDocument();
  });

  it("displays percentage complete", () => {
    render(<GoalProgressCard progress={mockProgress} colorIndex={0} />);
    expect(screen.getByText("45% complete")).toBeInTheDocument();
  });

  it("displays time estimate", () => {
    render(<GoalProgressCard progress={mockProgress} colorIndex={0} />);
    expect(screen.getByText("5 years to go")).toBeInTheDocument();
  });

  it("renders progress bar with correct value", () => {
    render(<GoalProgressCard progress={mockProgress} colorIndex={0} />);
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("aria-valuenow", "45");
  });

  it("applies goal color to title", () => {
    render(<GoalProgressCard progress={mockProgress} colorIndex={0} />);
    const title = screen.getByText("Retirement Fund");
    expect(title).toHaveStyle({ color: "#f59e0b" });
  });

  it("shows 'Achieved!' for achieved goals", () => {
    const achievedProgress: GoalProgress = {
      ...mockProgress,
      percentage: 100,
      isAchieved: true,
      timeEstimate: "Achieved!",
    };
    render(<GoalProgressCard progress={achievedProgress} colorIndex={0} />);
    expect(screen.getByText("Achieved!")).toBeInTheDocument();
    expect(screen.getByText("100% complete")).toBeInTheDocument();
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

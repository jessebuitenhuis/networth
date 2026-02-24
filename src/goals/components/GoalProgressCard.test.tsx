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

  it("applies goal color via CSS variable", () => {
    const page = GoalProgressCardPage.render({ progress: mockProgress, colorIndex: 0 });
    const title = page.getByText("Retirement Fund");
    const card = title.closest("[data-slot='card']") as HTMLElement;
    expect(card.style.getPropertyValue("--goal-color")).toBe("#f59e0b");
    expect(title).toHaveClass("goal-name");
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
    const card1 = screen.getByText("Retirement Fund").closest("[data-slot='card']") as HTMLElement;
    expect(card1.style.getPropertyValue("--goal-color")).toBe("#10b981");

    rerender(<GoalProgressCard progress={mockProgress} colorIndex={2} />);
    const card2 = screen.getByText("Retirement Fund").closest("[data-slot='card']") as HTMLElement;
    expect(card2.style.getPropertyValue("--goal-color")).toBe("#f43f5e");
  });
});

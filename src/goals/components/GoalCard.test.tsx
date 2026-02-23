import { describe, expect, it } from "vitest";

import type { Goal } from "@/goals/Goal.type";

import { GoalCardPage } from "./GoalCard.page";

const goal: Goal = {
  id: "1",
  name: "Emergency Fund",
  targetAmount: 10000,
};

describe("GoalCard", () => {
  it("displays goal name", () => {
    const page = GoalCardPage.render({ goal });
    expect(page.getByText("Emergency Fund")).toBeInTheDocument();
  });

  it("displays formatted target amount", () => {
    const page = GoalCardPage.render({ goal });
    expect(page.getByText("$10,000.00")).toBeInTheDocument();
  });

  it("renders edit action", () => {
    const page = GoalCardPage.render({ goal });
    expect(page.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });
});

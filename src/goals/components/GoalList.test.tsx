import { beforeEach, describe, expect, it } from "vitest";

import { mockApiResponses } from "@/test/mocks/mockApiResponses";

import { GoalListPage } from "./GoalList.page";

describe("GoalList", () => {
  beforeEach(() => {
    mockApiResponses();
  });

  it("displays empty state when no goals exist", () => {
    const page = GoalListPage.render([]);
    expect(
      page.getByText(
        /no goals yet\. add a goal to start tracking your financial targets\./i,
      ),
    ).toBeInTheDocument();
  });

  it("renders goal cards when goals exist", async () => {
    const goals = [
      { id: "1", name: "Emergency Fund", targetAmount: 10000 },
      { id: "2", name: "FIRE", targetAmount: 500000 },
    ];

    const page = GoalListPage.render(goals);

    expect(page.getByText("Emergency Fund")).toBeInTheDocument();
    expect(page.getByText("FIRE")).toBeInTheDocument();
  });

  it("renders edit dialog for each goal", async () => {
    const goals = [{ id: "1", name: "Emergency Fund", targetAmount: 10000 }];

    const page = GoalListPage.render(goals);

    expect(
      page.getByRole("button", { name: "Edit Goal" }),
    ).toBeInTheDocument();
  });
});

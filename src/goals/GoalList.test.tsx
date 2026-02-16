import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { mockApiResponses } from "@/test/mocks/mockApiResponses";

import { GoalProvider } from "./GoalContext";
import { GoalList } from "./GoalList";

describe("GoalList", () => {
  beforeEach(() => {
    mockApiResponses();
  });

  it("displays empty state when no goals exist", () => {
    render(
      <GoalProvider>
        <GoalList />
      </GoalProvider>,
    );
    expect(
      screen.getByText(
        /no goals yet\. add a goal to start tracking your financial targets\./i,
      ),
    ).toBeInTheDocument();
  });

  it("renders goal cards when goals exist", async () => {
    mockApiResponses({
      goals: [
        { id: "1", name: "Emergency Fund", targetAmount: 10000 },
        { id: "2", name: "FIRE", targetAmount: 500000 },
      ],
    });

    render(
      <GoalProvider>
        <GoalList />
      </GoalProvider>,
    );

    expect(await screen.findByText("Emergency Fund")).toBeInTheDocument();
    expect(screen.getByText("FIRE")).toBeInTheDocument();
  });

  it("renders edit dialog for each goal", async () => {
    mockApiResponses({
      goals: [{ id: "1", name: "Emergency Fund", targetAmount: 10000 }],
    });

    render(
      <GoalProvider>
        <GoalList />
      </GoalProvider>,
    );

    expect(
      await screen.findByRole("button", { name: "Edit Goal" }),
    ).toBeInTheDocument();
  });
});

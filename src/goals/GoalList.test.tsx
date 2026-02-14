import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { GoalProvider } from "./GoalContext";
import { GoalList } from "./GoalList";

describe("GoalList", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("displays empty state when no goals exist", () => {
    render(
      <GoalProvider>
        <GoalList />
      </GoalProvider>
    );
    expect(
      screen.getByText(
        /no goals yet\. add a goal to start tracking your financial targets\./i
      )
    ).toBeInTheDocument();
  });

  it("renders goal cards when goals exist", () => {
    localStorage.setItem(
      "goals",
      JSON.stringify([
        { id: "1", name: "Emergency Fund", targetAmount: 10000 },
        { id: "2", name: "FIRE", targetAmount: 500000 },
      ])
    );

    render(
      <GoalProvider>
        <GoalList />
      </GoalProvider>
    );

    expect(screen.getByText("Emergency Fund")).toBeInTheDocument();
    expect(screen.getByText("FIRE")).toBeInTheDocument();
  });

  it("renders edit dialog for each goal", () => {
    localStorage.setItem(
      "goals",
      JSON.stringify([
        { id: "1", name: "Emergency Fund", targetAmount: 10000 },
      ])
    );

    render(
      <GoalProvider>
        <GoalList />
      </GoalProvider>
    );

    expect(
      screen.getByRole("button", { name: "Edit Goal" })
    ).toBeInTheDocument();
  });
});

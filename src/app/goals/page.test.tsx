import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { SidebarProvider } from "@/components/ui/sidebar";
import { GoalProvider } from "@/goals/GoalContext";

import GoalsPage from "./page";

describe("GoalsPage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders TopBar with title", () => {
    render(
      <SidebarProvider>
        <GoalProvider>
          <GoalsPage />
        </GoalProvider>
      </SidebarProvider>
    );
    expect(screen.getByRole("heading", { name: "Goals" })).toBeInTheDocument();
  });

  it("renders CreateGoalDialog in TopBar actions", () => {
    render(
      <SidebarProvider>
        <GoalProvider>
          <GoalsPage />
        </GoalProvider>
      </SidebarProvider>
    );
    expect(
      screen.getByRole("button", { name: /add goal/i })
    ).toBeInTheDocument();
  });

  it("renders GoalList", () => {
    render(
      <SidebarProvider>
        <GoalProvider>
          <GoalsPage />
        </GoalProvider>
      </SidebarProvider>
    );
    expect(
      screen.getByText(
        /no goals yet\. add a goal to start tracking your financial targets\./i
      )
    ).toBeInTheDocument();
  });
});

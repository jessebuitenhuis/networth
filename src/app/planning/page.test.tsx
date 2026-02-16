import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AccountProvider } from "@/accounts/AccountContext";
import { AccountType } from "@/accounts/AccountType";
import { SidebarProvider } from "@/components/ui/sidebar";
import { GoalProvider } from "@/goals/GoalContext";
import { RecurringTransactionProvider } from "@/recurring-transactions/RecurringTransactionContext";
import { ScenarioProvider } from "@/scenarios/ScenarioContext";
import { TransactionProvider } from "@/transactions/TransactionContext";

import PlanningPage from "./page";

// AGENT: there's a util function for this. Use it here and check if this happens in more places
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);

function renderPage() {
  return render(
    <SidebarProvider>
      <AccountProvider>
        <TransactionProvider>
          <ScenarioProvider>
            <RecurringTransactionProvider>
              <GoalProvider>
                <PlanningPage />
              </GoalProvider>
            </RecurringTransactionProvider>
          </ScenarioProvider>
        </TransactionProvider>
      </AccountProvider>
    </SidebarProvider>
  );
}

describe("PlanningPage", () => {
  beforeEach(() => localStorage.clear());

  // AGENT: the it(renders the...) tests here use a lot of duplication. Should this be done with it.each() or asserting multiple items in one go? Also check other test cases that follow the same pattern in this and other files.
  it("renders the Planning heading", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Planning" })
    ).toBeInTheDocument();
  });

  it("renders the projected net worth chart", () => {
    renderPage();

    expect(screen.getByTestId("projected-chart")).toBeInTheDocument();
  });

  it("renders the scenario picker", () => {
    renderPage();

    expect(
      screen.getByRole("button", { name: /scenarios/i })
    ).toBeInTheDocument();
  });

  it("renders the account picker", () => {
    renderPage();

    expect(
      screen.getByRole("button", { name: /accounts/i })
    ).toBeInTheDocument();
  });

  it("renders the create scenario button", () => {
    renderPage();

    expect(
      screen.getByRole("button", { name: /new scenario/i })
    ).toBeInTheDocument();
  });

  it("toggles scenario selection when checkbox is clicked", async () => {
    localStorage.setItem("scenarios", JSON.stringify([
      { id: "scenario-1", name: "Optimistic" }
    ]));

    renderPage();

    // Initially shows 0 selected
    expect(screen.getByRole("button", { name: "Scenarios (0)" })).toBeInTheDocument();

    // Open picker and click scenario
    await userEvent.click(screen.getByRole("button", { name: "Scenarios (0)" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Optimistic" }));

    // Should update to 1 selected
    expect(screen.getByRole("button", { name: "Scenarios (1)" })).toBeInTheDocument();
  });

  it("toggles account filter when checkbox is clicked", async () => {
    localStorage.setItem("accounts", JSON.stringify([
      { id: "acc-1", name: "Checking", type: AccountType.Asset }
    ]));

    renderPage();

    // Initially shows 1 account (all included)
    expect(screen.getByRole("button", { name: "Accounts (1)" })).toBeInTheDocument();

    // Open picker and toggle account off
    await userEvent.click(screen.getByRole("button", { name: "Accounts (1)" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Checking" }));

    // Should update to 0 accounts
    expect(screen.getByRole("button", { name: "Accounts (0)" })).toBeInTheDocument();
  });

  it("clears all scenarios when Deselect all is clicked", async () => {
    localStorage.setItem("scenarios", JSON.stringify([
      { id: "scenario-1", name: "Optimistic" },
      { id: "scenario-2", name: "Conservative" }
    ]));

    renderPage();

    // Select two scenarios
    await userEvent.click(screen.getByRole("button", { name: "Scenarios (0)" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Optimistic" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Conservative" }));

    expect(screen.getByRole("button", { name: "Scenarios (2)" })).toBeInTheDocument();

    // Click Deselect all
    await userEvent.click(screen.getByRole("button", { name: "Deselect all" }));

    // Should clear selection
    expect(screen.getByRole("button", { name: "Scenarios (0)" })).toBeInTheDocument();
  });
});

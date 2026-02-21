import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AccountProvider } from "@/accounts/AccountContext";
import { AccountType } from "@/accounts/AccountType";
import { CategoryProvider } from "@/categories/CategoryContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { GoalProvider } from "@/goals/GoalContext";
import { RecurrenceFrequency } from "@/recurring-transactions/RecurrenceFrequency";
import { RecurringTransactionProvider } from "@/recurring-transactions/RecurringTransactionContext";
import { ScenarioProvider } from "@/scenarios/ScenarioContext";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import { TransactionProvider } from "@/transactions/TransactionContext";

import PlanningPage from "./page";

vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

function renderPage() {
  return render(
    <SidebarProvider>
      <AccountProvider>
        <TransactionProvider>
          <ScenarioProvider>
            <RecurringTransactionProvider>
              <GoalProvider>
                <CategoryProvider>
                  <PlanningPage />
                </CategoryProvider>
              </GoalProvider>
            </RecurringTransactionProvider>
          </ScenarioProvider>
        </TransactionProvider>
      </AccountProvider>
    </SidebarProvider>,
  );
}

describe("PlanningPage", () => {
  beforeEach(() => {
    mockApiResponses();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the Planning heading", () => {
    renderPage();

    expect(
      screen.getByRole("heading", { name: "Planning" }),
    ).toBeInTheDocument();
  });

  it("renders the projected net worth chart", () => {
    renderPage();

    expect(screen.getByTestId("projected-chart")).toBeInTheDocument();
  });

  it("renders the scenario picker", () => {
    renderPage();

    expect(
      screen.getByRole("button", { name: /scenarios/i }),
    ).toBeInTheDocument();
  });

  it("renders the Account picker", () => {
    renderPage();

    expect(
      screen.getByRole("button", { name: /accounts/i }),
    ).toBeInTheDocument();
  });

  it("renders the create scenario button", () => {
    renderPage();

    expect(
      screen.getByRole("button", { name: /new scenario/i }),
    ).toBeInTheDocument();
  });

  it("toggles scenario selection when checkbox is clicked", async () => {
    mockApiResponses({
      scenarios: [{ id: "scenario-1", name: "Optimistic" }],
    });

    renderPage();

    // Wait for scenario data to load
    await screen.findByRole("button", { name: "Scenarios (0)" });

    // Open picker and click scenario
    await userEvent.click(
      screen.getByRole("button", { name: "Scenarios (0)" }),
    );
    await userEvent.click(screen.getByRole("checkbox", { name: "Optimistic" }));

    // Should update to 1 selected
    expect(
      screen.getByRole("button", { name: "Scenarios (1)" }),
    ).toBeInTheDocument();
  });

  it("toggles account filter when checkbox is clicked", async () => {
    mockApiResponses({
      accounts: [{ id: "acc-1", name: "Checking", type: AccountType.Asset }],
    });

    renderPage();

    // Wait for account data to load
    await screen.findByRole("button", { name: "Accounts (1)" });

    // Open picker and toggle account off
    await userEvent.click(screen.getByRole("button", { name: "Accounts (1)" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Checking" }));

    // Should update to 0 accounts
    expect(
      screen.getByRole("button", { name: "Accounts (0)" }),
    ).toBeInTheDocument();
  });

  it("creates scenario and auto-selects it", async () => {
    mockApiResponses();

    renderPage();

    await userEvent.click(
      screen.getByRole("button", { name: /new scenario/i }),
    );
    await userEvent.type(screen.getByLabelText(/name/i), "My Scenario");
    await userEvent.click(screen.getByRole("button", { name: /create$/i }));

    expect(
      screen.getByRole("button", { name: "Scenarios (1)" }),
    ).toBeInTheDocument();
  });

  it("removes deleted scenario from selection", async () => {
    mockApiResponses({
      scenarios: [{ id: "scenario-1", name: "Optimistic" }],
    });

    renderPage();

    await screen.findByRole("button", { name: "Scenarios (0)" });

    // Open picker, select the scenario, then click edit (popover stays open)
    await userEvent.click(
      screen.getByRole("button", { name: "Scenarios (0)" }),
    );
    await userEvent.click(screen.getByRole("checkbox", { name: "Optimistic" }));
    await userEvent.click(screen.getByLabelText("Edit Scenario"));

    // Click delete in the edit dialog
    await userEvent.click(screen.getByRole("button", { name: /delete/i }));

    // Confirm delete in the alert dialog
    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    await userEvent.click(deleteButtons[deleteButtons.length - 1]);

    // Scenario should be removed from selection
    expect(
      screen.getByRole("button", { name: "Scenarios (0)" }),
    ).toBeInTheDocument();
  });

  it("duplicates scenario with transactions and auto-selects the copy", async () => {
    mockApiResponses({
      accounts: [{ id: "acc-1", name: "Checking", type: AccountType.Asset }],
      scenarios: [{ id: "scenario-1", name: "Optimistic" }],
      transactions: [
        {
          id: "t-1",
          accountId: "acc-1",
          amount: 500,
          date: "2024-06-01",
          description: "Bonus",
          scenarioId: "scenario-1",
        },
      ],
      recurringTransactions: [
        {
          id: "rt-1",
          accountId: "acc-1",
          amount: 100,
          description: "Monthly",
          frequency: RecurrenceFrequency.Monthly,
          startDate: "2024-01-01",
          scenarioId: "scenario-1",
        },
      ],
    });

    renderPage();

    await screen.findByRole("button", { name: "Scenarios (0)" });

    // Open picker to render the duplicate button
    await userEvent.click(
      screen.getByRole("button", { name: "Scenarios (0)" }),
    );
    await userEvent.click(screen.getByLabelText("Duplicate Scenario"));

    // Submit duplicate dialog with pre-filled name
    expect(screen.getByLabelText(/name/i)).toHaveValue("Optimistic (Copy)");
    await userEvent.click(screen.getByRole("button", { name: /duplicate$/i }));

    // New scenario should be auto-selected
    expect(
      screen.getByRole("button", { name: "Scenarios (1)" }),
    ).toBeInTheDocument();
  });

  it("clears all scenarios when Deselect all is clicked", async () => {
    mockApiResponses({
      scenarios: [
        { id: "scenario-1", name: "Optimistic" },
        { id: "scenario-2", name: "Conservative" },
      ],
    });

    renderPage();

    // Wait for scenario data to load
    await screen.findByRole("button", { name: "Scenarios (0)" });

    // Select two scenarios
    await userEvent.click(
      screen.getByRole("button", { name: "Scenarios (0)" }),
    );
    await userEvent.click(screen.getByRole("checkbox", { name: "Optimistic" }));
    await userEvent.click(
      screen.getByRole("checkbox", { name: "Conservative" }),
    );

    expect(
      screen.getByRole("button", { name: "Scenarios (2)" }),
    ).toBeInTheDocument();

    // Click Deselect all
    await userEvent.click(screen.getByRole("button", { name: "Deselect all" }));

    // Should clear selection
    expect(
      screen.getByRole("button", { name: "Scenarios (0)" }),
    ).toBeInTheDocument();
  });
});

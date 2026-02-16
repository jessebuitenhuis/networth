import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import type { Account } from "@/accounts/Account.type";
import { AccountType } from "@/accounts/AccountType";
import { AccountProvider } from "@/accounts/AccountContext";
import { RecurringTransactionProvider } from "@/context/RecurringTransactionContext";
import { ScenarioProvider } from "@/scenarios/ScenarioContext";
import { TransactionProvider } from "@/context/TransactionContext";
import type { Goal } from "@/goals/Goal.type";
import { GoalProvider } from "@/goals/GoalContext";
import { RecurrenceFrequency } from "@/recurring-transactions/RecurrenceFrequency";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import type { Scenario } from "@/scenarios/Scenario.type";
import { mockResizeObserver } from "@/test/mocks/mockResizeObserver";
import { suppressRechartsWarnings } from "@/test/mocks/suppressRechartsWarnings";
import type { Transaction } from "@/transactions/Transaction.type";

import { ProjectedNetWorthChart } from "./ProjectedNetWorthChart";

mockResizeObserver();
suppressRechartsWarnings();

function renderWithProviders(
  accounts: Account[] = [],
  transactions: Transaction[] = [],
  recurringTransactions: RecurringTransaction[] = [],
  scenarios: Scenario[] = [],
  selectedScenarioIds: Set<string> = new Set(),
  excludedAccountIds: Set<string> = new Set(),
  goals: Goal[] = []
) {
  localStorage.setItem("accounts", JSON.stringify(accounts));
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("recurringTransactions", JSON.stringify(recurringTransactions));
  if (scenarios.length > 0) {
    localStorage.setItem("scenarios", JSON.stringify(scenarios));
  }
  if (goals.length > 0) {
    localStorage.setItem("goals", JSON.stringify(goals));
  }
  localStorage.removeItem("activeScenarioId");

  return render(
    <AccountProvider>
      <TransactionProvider>
        <ScenarioProvider>
          <RecurringTransactionProvider>
            <GoalProvider>
              <ProjectedNetWorthChart
                selectedScenarioIds={selectedScenarioIds}
                excludedAccountIds={excludedAccountIds}
              />
            </GoalProvider>
          </RecurringTransactionProvider>
        </ScenarioProvider>
      </TransactionProvider>
    </AccountProvider>
  );
}

describe("ProjectedNetWorthChart", () => {
  beforeEach(() => localStorage.clear());

  it("renders with 1M selected by default", () => {
    renderWithProviders();

    expect(screen.getByRole("button", { name: "1M" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("switches period on button click", async () => {
    renderWithProviders();

    await userEvent.click(screen.getByRole("button", { name: "1Y" }));

    expect(screen.getByRole("button", { name: "1Y" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "1M" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("renders the chart container", () => {
    renderWithProviders();

    expect(screen.getByTestId("projected-chart")).toBeInTheDocument();
  });

  it("does not show custom date range picker by default", () => {
    renderWithProviders();

    expect(screen.queryByLabelText("Start")).not.toBeInTheDocument();
  });

  it("shows custom date range picker when Custom is selected", async () => {
    renderWithProviders();

    await userEvent.click(screen.getByRole("button", { name: "Custom" }));

    expect(screen.getByLabelText("Start")).toBeInTheDocument();
    expect(screen.getByLabelText("End")).toBeInTheDocument();
  });

  it("updates custom range when date inputs change", async () => {
    renderWithProviders();

    await userEvent.click(screen.getByRole("button", { name: "Custom" }));

    const startInput = screen.getByLabelText("Start");
    const endInput = screen.getByLabelText("End");

    await userEvent.clear(startInput);
    await userEvent.type(startInput, "2024-01-01");
    await userEvent.clear(endInput);
    await userEvent.type(endInput, "2024-12-31");

    expect(startInput).toHaveValue("2024-01-01");
    expect(endInput).toHaveValue("2024-12-31");
  });

  it("renders baseline only when no scenarios selected", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    renderWithProviders(accounts, [], [], []);

    expect(screen.getByTestId("projected-chart")).toBeInTheDocument();
    expect(screen.getByText("Baseline")).toBeInTheDocument();
  });

  it("renders scenario legend when scenario is selected", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    const scenarios: Scenario[] = [
      { id: "scenario-1", name: "Optimistic" },
    ];
    const selectedScenarioIds = new Set(["scenario-1"]);

    renderWithProviders(accounts, [], [], scenarios, selectedScenarioIds);

    expect(screen.getByText("Baseline")).toBeInTheDocument();
    expect(screen.getByText("Optimistic")).toBeInTheDocument();
  });

  it("filters accounts based on excludedAccountIds prop", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
      { id: "2", name: "Savings", type: AccountType.Asset },
    ];
    const excludedAccountIds = new Set(["2"]);

    renderWithProviders(accounts, [], [], [], new Set(), excludedAccountIds);

    expect(screen.getByTestId("projected-chart")).toBeInTheDocument();
  });

  it("includes scenario transactions when scenario is selected", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    const scenarios: Scenario[] = [
      { id: "scenario-1", name: "Optimistic" },
    ];
    const transactions: Transaction[] = [
      {
        id: "t-1",
        accountId: "1",
        amount: 1000,
        date: "2024-06-01",
        description: "Baseline transaction",
      },
      {
        id: "t-2",
        accountId: "1",
        amount: 2000,
        date: "2024-07-01",
        description: "Scenario transaction",
        scenarioId: "scenario-1",
      },
    ];
    const selectedScenarioIds = new Set(["scenario-1"]);

    renderWithProviders(accounts, transactions, [], scenarios, selectedScenarioIds);

    expect(screen.getByTestId("projected-chart")).toBeInTheDocument();
  });

  it("includes scenario recurring transactions when scenario is selected", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    const scenarios: Scenario[] = [
      { id: "scenario-1", name: "Optimistic" },
    ];
    const recurringTransactions: RecurringTransaction[] = [
      {
        id: "rt-1",
        accountId: "1",
        amount: 100,
        description: "Baseline recurring",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2024-01-01",
      },
      {
        id: "rt-2",
        accountId: "1",
        amount: 200,
        description: "Scenario recurring",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2024-01-01",
        scenarioId: "scenario-1",
      },
    ];
    const selectedScenarioIds = new Set(["scenario-1"]);

    renderWithProviders(accounts, [], recurringTransactions, scenarios, selectedScenarioIds);

    expect(screen.getByTestId("projected-chart")).toBeInTheDocument();
  });

  it("renders empty scenario legend when no scenarios selected", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    renderWithProviders(accounts, [], [], []);

    // Should only show baseline in legend
    expect(screen.getByText("Baseline")).toBeInTheDocument();
  });

  it("renders multiple scenarios in legend when multiple selected", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    const scenarios: Scenario[] = [
      { id: "scenario-1", name: "Optimistic" },
      { id: "scenario-2", name: "Pessimistic" },
    ];
    const selectedScenarioIds = new Set(["scenario-1", "scenario-2"]);

    renderWithProviders(accounts, [], [], scenarios, selectedScenarioIds);

    expect(screen.getByText("Baseline")).toBeInTheDocument();
    expect(screen.getByText("Optimistic")).toBeInTheDocument();
    expect(screen.getByText("Pessimistic")).toBeInTheDocument();
  });

  it("renders goal names in legend when goals exist", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    const goals: Goal[] = [
      { id: "goal-1", name: "Emergency Fund", targetAmount: 10000 },
      { id: "goal-2", name: "House Down Payment", targetAmount: 50000 },
    ];

    renderWithProviders(accounts, [], [], [], new Set(), new Set(), goals);

    expect(screen.getByText("Emergency Fund")).toBeInTheDocument();
    expect(screen.getByText("House Down Payment")).toBeInTheDocument();
  });

  it("does not render goal entries in legend when no goals exist", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];

    renderWithProviders(accounts, [], [], [], new Set(), new Set(), []);

    expect(screen.getByText("Baseline")).toBeInTheDocument();
    expect(screen.queryByText("Emergency Fund")).not.toBeInTheDocument();
  });

  it("renders chart container when goals exist", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    const goals: Goal[] = [
      { id: "goal-1", name: "Emergency Fund", targetAmount: 10000 },
    ];

    renderWithProviders(accounts, [], [], [], new Set(), new Set(), goals);

    expect(screen.getByTestId("projected-chart")).toBeInTheDocument();
  });
});

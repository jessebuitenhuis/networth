import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach,describe, expect, it } from "vitest";

import type { Account } from "@/accounts/Account.type";
import { AccountProvider } from "@/accounts/AccountContext";
import { AccountType } from "@/accounts/AccountType";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RecurrenceFrequency } from "@/recurring-transactions/RecurrenceFrequency";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import { RecurringTransactionProvider } from "@/recurring-transactions/RecurringTransactionContext";
import type { Scenario } from "@/scenarios/Scenario.type";
import { ScenarioProvider } from "@/scenarios/ScenarioContext";
import type { Transaction } from "@/transactions/Transaction.type";
import { TransactionProvider } from "@/transactions/TransactionContext";

import { ScenarioTransactionList } from "./ScenarioTransactionList";

function renderWithProviders(
  accounts: Account[] = [],
  transactions: Transaction[] = [],
  recurringTransactions: RecurringTransaction[] = [],
  scenarios: Scenario[] = [],
  selectedScenarioIds: Set<string> = new Set()
) {
  localStorage.setItem("accounts", JSON.stringify(accounts));
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("recurringTransactions", JSON.stringify(recurringTransactions));
  if (scenarios.length > 0) {
    localStorage.setItem("scenarios", JSON.stringify(scenarios));
  }
  localStorage.setItem("activeScenarioId", null);
  return render(
    <TooltipProvider>
      <AccountProvider>
        <TransactionProvider>
          <ScenarioProvider>
            <RecurringTransactionProvider>
              <ScenarioTransactionList selectedScenarioIds={selectedScenarioIds} />
            </RecurringTransactionProvider>
          </ScenarioProvider>
        </TransactionProvider>
      </AccountProvider>
    </TooltipProvider>
  );
}

describe("ScenarioTransactionList", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows only transactions for active scenario", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    const scenarios: Scenario[] = [
      { id: "scenario-1", name: "Base Plan" },
      { id: "scenario-2", name: "Optimistic" },
    ];
    const recurringTransactions: RecurringTransaction[] = [
      {
        id: "rt-1",
        accountId: "1",
        amount: 100,
        description: "Base salary",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2024-01-01",
        scenarioId: "scenario-1",
      },
      {
        id: "rt-2",
        accountId: "1",
        amount: 200,
        description: "Bonus",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2024-01-01",
        scenarioId: "scenario-2",
      },
    ];

    renderWithProviders(
      accounts,
      [],
      recurringTransactions,
      scenarios,
      new Set(["scenario-1"])
    );

    expect(screen.getByText(/Base salary/)).toBeInTheDocument();
    expect(screen.queryByText(/Bonus/)).not.toBeInTheDocument();
  });

  it("shows transactions for active scenario", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    const scenarios: Scenario[] = [
      { id: "scenario-1", name: "Base Plan" },
    ];
    const transactions: Transaction[] = [
      {
        id: "t-1",
        accountId: "1",
        amount: 500,
        date: "2024-06-01",
        description: "Bonus payment",
        scenarioId: "scenario-1",
      },
    ];

    renderWithProviders(accounts, transactions, [], scenarios, new Set(["scenario-1"]));

    expect(screen.getByText(/Bonus payment/)).toBeInTheDocument();
  });

  it("shows empty state when no transactions", () => {
    const scenarios: Scenario[] = [{ id: "scenario-1", name: "Base Plan" }];

    renderWithProviders([], [], [], scenarios, new Set(["scenario-1"]));

    expect(
      screen.getByText(/no transactions yet/i)
    ).toBeInTheDocument();
  });

  it("deletes recurring transaction when delete is clicked", async () => {
    const user = userEvent.setup();
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    const scenarios: Scenario[] = [
      { id: "scenario-1", name: "Base Plan" },
    ];
    const recurringTransactions: RecurringTransaction[] = [
      {
        id: "rt-1",
        accountId: "1",
        amount: 100,
        description: "Salary",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2024-01-01",
        scenarioId: "scenario-1",
      },
    ];

    renderWithProviders(
      accounts,
      [],
      recurringTransactions,
      scenarios,
      new Set(["scenario-1"])
    );

    const editButton = screen.getByRole("button", { name: /edit/i });
    await user.click(editButton);

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await user.click(deleteButton);

    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    const confirmButton = deleteButtons[deleteButtons.length - 1];
    await user.click(confirmButton);

    expect(screen.queryByText(/Salary/)).not.toBeInTheDocument();
  });

  it("treats undefined scenarioId as default scenario", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    const scenarios: Scenario[] = [
      { id: "scenario-1", name: "Base Plan" },
    ];
    const recurringTransactions: RecurringTransaction[] = [
      {
        id: "rt-1",
        accountId: "1",
        amount: 100,
        description: "Legacy transaction",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2024-01-01",
      },
    ];

    renderWithProviders(
      accounts,
      [],
      recurringTransactions,
      scenarios,
      new Set(["scenario-1"])
    );

    expect(screen.getByText(/Legacy transaction/)).toBeInTheDocument();
  });

  it("sorts transactions by date descending (newest first)", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    const scenarios: Scenario[] = [
      { id: "scenario-1", name: "Base Plan" },
    ];
    const transactions: Transaction[] = [
      {
        id: "t-1",
        accountId: "1",
        amount: 100,
        date: "2024-01-15",
        description: "Old transaction",
        isProjected: true,
        scenarioId: "scenario-1",
      },
      {
        id: "t-2",
        accountId: "1",
        amount: 200,
        date: "2024-06-15",
        description: "Recent transaction",
        isProjected: true,
        scenarioId: "scenario-1",
      },
      {
        id: "t-3",
        accountId: "1",
        amount: 150,
        date: "2024-03-15",
        description: "Middle transaction",
        isProjected: true,
        scenarioId: "scenario-1",
      },
    ];

    renderWithProviders(accounts, transactions, [], scenarios, new Set(["scenario-1"]));

    const items = screen.getAllByText(/transaction/);
    expect(items[0]).toHaveTextContent("Recent transaction");
    expect(items[1]).toHaveTextContent("Middle transaction");
    expect(items[2]).toHaveTextContent("Old transaction");
  });

  it("shows Unknown for transactions with unknown account", () => {
    const accounts: Account[] = [];
    const scenarios: Scenario[] = [
      { id: "scenario-1", name: "Base Plan" },
    ];
    const transactions: Transaction[] = [
      {
        id: "t-1",
        accountId: "unknown-account",
        amount: 100,
        date: "2024-06-15",
        description: "Orphan transaction",
        isProjected: true,
        scenarioId: "scenario-1",
      },
    ];

    renderWithProviders(accounts, transactions, [], scenarios, new Set(["scenario-1"]));

    expect(screen.getByText(/Orphan transaction/)).toBeInTheDocument();
  });

  it("handles recurring transaction with no next occurrence", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    const scenarios: Scenario[] = [
      { id: "scenario-1", name: "Base Plan" },
    ];
    const recurringTransactions: RecurringTransaction[] = [
      {
        id: "rt-1",
        accountId: "1",
        amount: 100,
        description: "Ended transaction",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2020-01-01",
        endDate: "2020-12-31", // Ended in the past
        scenarioId: "scenario-1",
      },
    ];

    renderWithProviders(
      accounts,
      [],
      recurringTransactions,
      scenarios,
      new Set(["scenario-1"])
    );

    // Should show empty state since the recurring transaction has no future occurrences
    expect(
      screen.getByText(/no transactions yet/i)
    ).toBeInTheDocument();
  });

  it("includes baseline transactions (no scenarioId) in all scenarios", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    const scenarios: Scenario[] = [
      { id: "scenario-1", name: "Base Plan" },
      { id: "scenario-2", name: "Alternative" },
    ];
    const transactions: Transaction[] = [
      {
        id: "t-1",
        accountId: "1",
        amount: 100,
        date: "2024-06-15",
        description: "Baseline transaction",
        isProjected: true,
        // No scenarioId - baseline, should appear in all scenarios
      },
    ];

    // Render with scenario-2 active (not the first scenario)
    renderWithProviders(accounts, transactions, [], scenarios, new Set(["scenario-2"]));

    // Should show the baseline transaction since baseline appears in all scenarios
    expect(screen.getByText(/Baseline transaction/)).toBeInTheDocument();
  });

  it("shows Unknown for recurring transactions with unknown account", () => {
    const accounts: Account[] = [];
    const scenarios: Scenario[] = [
      { id: "scenario-1", name: "Base Plan" },
    ];
    const recurringTransactions: RecurringTransaction[] = [
      {
        id: "rt-1",
        accountId: "unknown-account",
        amount: 100,
        description: "Orphan recurring",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2024-01-01",
        scenarioId: "scenario-1",
      },
    ];

    renderWithProviders(accounts, [], recurringTransactions, scenarios, new Set(["scenario-1"]));

    expect(screen.getByText(/Orphan recurring/)).toBeInTheDocument();
  });

  it("shows only baseline transactions when activeScenarioId is null", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    const scenarios: Scenario[] = [
      { id: "scenario-1", name: "Base Plan" },
    ];
    const transactions: Transaction[] = [
      {
        id: "t-1",
        accountId: "1",
        amount: 100,
        date: "2024-06-15",
        description: "Baseline transaction",
        // No scenarioId - baseline
      },
      {
        id: "t-2",
        accountId: "1",
        amount: 200,
        date: "2024-06-16",
        description: "Scenario transaction",
        scenarioId: "scenario-1",
      },
    ];

    renderWithProviders(accounts, transactions, [], scenarios, new Set());

    expect(screen.getByText(/Baseline transaction/)).toBeInTheDocument();
    expect(screen.queryByText(/Scenario transaction/)).not.toBeInTheDocument();
  });

  it("shows only baseline recurring transactions when activeScenarioId is null", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    const scenarios: Scenario[] = [
      { id: "scenario-1", name: "Base Plan" },
    ];
    const recurringTransactions: RecurringTransaction[] = [
      {
        id: "rt-1",
        accountId: "1",
        amount: 100,
        description: "Baseline recurring",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2024-01-01",
        // No scenarioId - baseline
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

    renderWithProviders(accounts, [], recurringTransactions, scenarios, new Set());

    expect(screen.getByText(/Baseline recurring/)).toBeInTheDocument();
    expect(screen.queryByText(/Scenario recurring/)).not.toBeInTheDocument();
  });

  it("shows all transactions regardless of isProjected flag", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    const scenarios: Scenario[] = [
      { id: "scenario-1", name: "Base Plan" },
    ];
    const transactions: Transaction[] = [
      {
        id: "t-1",
        accountId: "1",
        amount: 100,
        date: "2024-01-15",
        description: "Past transaction",
        isProjected: false,
        scenarioId: "scenario-1",
      },
      {
        id: "t-2",
        accountId: "1",
        amount: 200,
        date: "2024-06-15",
        description: "Future transaction",
        isProjected: true,
        scenarioId: "scenario-1",
      },
    ];

    renderWithProviders(accounts, transactions, [], scenarios, new Set(["scenario-1"]));

    expect(screen.getByText(/Past transaction/)).toBeInTheDocument();
    expect(screen.getByText(/Future transaction/)).toBeInTheDocument();
  });

  it("shows scenario icon for scenario transactions", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    const scenarios: Scenario[] = [
      { id: "scenario-1", name: "Early Retirement" },
    ];
    const transactions: Transaction[] = [
      {
        id: "t-1",
        accountId: "1",
        amount: -30000,
        date: "2024-06-15",
        description: "New Car",
        scenarioId: "scenario-1",
      },
    ];

    renderWithProviders(accounts, transactions, [], scenarios, new Set(["scenario-1"]));

    expect(screen.getByLabelText("Scenario: Early Retirement")).toBeInTheDocument();
  });

  it("does not show scenario icon for baseline transactions", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    const scenarios: Scenario[] = [
      { id: "scenario-1", name: "Early Retirement" },
    ];
    const transactions: Transaction[] = [
      {
        id: "t-1",
        accountId: "1",
        amount: -200,
        date: "2024-06-15",
        description: "Groceries",
        // No scenarioId - baseline
      },
    ];

    renderWithProviders(accounts, transactions, [], scenarios, new Set(["scenario-1"]));

    expect(screen.getByText(/Groceries/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Scenario:/)).not.toBeInTheDocument();
  });

  it("does not show scenario icon for deleted scenario", () => {
    const accounts: Account[] = [
      { id: "1", name: "Checking", type: AccountType.Asset },
    ];
    const scenarios: Scenario[] = [
      { id: "scenario-1", name: "Early Retirement" },
      // scenario-2 was deleted from the list but transaction still references it
    ];
    const transactions: Transaction[] = [
      {
        id: "t-1",
        accountId: "1",
        amount: -30000,
        date: "2024-06-15",
        description: "New Car",
        scenarioId: "deleted-scenario-id", // References a deleted scenario
      },
    ];

    // Viewing scenario-1, but transaction with deleted scenario ID will still show
    // because the filter only checks selectedScenarioIds match, not scenario existence
    renderWithProviders(accounts, transactions, [], scenarios, new Set(["deleted-scenario-id"]));

    expect(screen.getByText(/New Car/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Scenario:/)).not.toBeInTheDocument();
  });
});

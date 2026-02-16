import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";
import { AccountProvider } from "@/context/AccountContext";
import { RecurringTransactionProvider } from "@/context/RecurringTransactionContext";
import { ScenarioProvider } from "@/context/ScenarioContext";
import { TransactionProvider } from "@/context/TransactionContext";
import { RecurrenceFrequency } from "@/recurring-transactions/RecurrenceFrequency";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import type { Scenario } from "@/scenarios/Scenario.type";
import type { Transaction } from "@/transactions/Transaction.type";

import { TransactionList } from "./TransactionList";

const transactions: Transaction[] = [
  { id: "t1", accountId: "a1", amount: 1000, date: "2024-01-15", description: "Opening balance" },
  { id: "t2", accountId: "a1", amount: -200, date: "2024-01-20", description: "Groceries" },
  { id: "t3", accountId: "a1", amount: 500, date: "2024-01-18", description: "Salary" },
];

function renderWithProvider(
  accountId: string,
  initialTransactions: Transaction[] = [],
  initialRecurring: RecurringTransaction[] = [],
  initialScenarios: Scenario[] = [],
  activeScenarioId?: string | null
) {
  localStorage.setItem("transactions", JSON.stringify(initialTransactions));
  localStorage.setItem(
    "recurringTransactions",
    JSON.stringify(initialRecurring)
  );
  localStorage.setItem("scenarios", JSON.stringify(initialScenarios));
  if (activeScenarioId !== undefined) {
    if (activeScenarioId === null) {
      localStorage.removeItem("activeScenarioId");
    } else {
      localStorage.setItem("activeScenarioId", activeScenarioId);
    }
  }
  return render(
    <TooltipProvider>
      <AccountProvider>
        <TransactionProvider>
          <ScenarioProvider>
            <RecurringTransactionProvider>
              <TransactionList accountId={accountId} />
            </RecurringTransactionProvider>
          </ScenarioProvider>
        </TransactionProvider>
      </AccountProvider>
    </TooltipProvider>
  );
}

describe("TransactionList", () => {
  beforeEach(() => localStorage.clear());

  it("shows empty message when no transactions", () => {
    renderWithProvider("a1");
    expect(screen.getByText("No transactions yet.")).toBeInTheDocument();
  });

  it("lists transactions sorted by date newest first", async () => {
    renderWithProvider("a1", transactions);

    const rows = await screen.findAllByRole("row");
    const dataRows = rows.slice(1); // Skip header row
    expect(dataRows).toHaveLength(3);
    expect(dataRows[0]).toHaveTextContent("Groceries");
    expect(dataRows[1]).toHaveTextContent("Salary");
    expect(dataRows[2]).toHaveTextContent("Opening balance");
  });

  it("displays date, description, and formatted amount", async () => {
    renderWithProvider("a1", [transactions[0]]);

    expect(await screen.findByText("Opening balance")).toBeInTheDocument();
    const formattedDate = new Date("2024-01-15T00:00:00").toLocaleDateString();
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
    expect(screen.getByText("+US$1,000.00")).toBeInTheDocument();
  });

  it("shows positive amounts in green", async () => {
    renderWithProvider("a1", [transactions[0]]);

    const amount = await screen.findByText("+US$1,000.00");
    expect(amount).toHaveClass("text-green-600");
  });

  it("shows negative amounts in red", async () => {
    renderWithProvider("a1", [transactions[1]]);

    const amount = await screen.findByText("-US$200.00");
    expect(amount).toHaveClass("text-red-600");
  });

  it("shows edit button for each transaction", async () => {
    renderWithProvider("a1", [transactions[0]]);

    const editButton = await screen.findByLabelText("Edit Transaction");
    expect(editButton).toBeInTheDocument();
  });

  it("renders future-dated transaction with dashed border", async () => {
    const futureTransactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: 1000, date: "2099-01-01", description: "Future tx" },
    ];
    const { container } = renderWithProvider("a1", futureTransactions);

    await screen.findByText("Future tx");
    const rows = container.querySelectorAll("[data-slot='table-row']");
    const dataRow = rows[1]; // Skip header row
    expect(dataRow).toHaveClass("border-dashed");
  });

  it("only shows transactions for the given account", async () => {
    const mixedTransactions = [
      ...transactions,
      { id: "t4", accountId: "a2", amount: 9999, date: "2024-01-25", description: "Other account" },
    ];
    renderWithProvider("a1", mixedTransactions);

    const rows = await screen.findAllByRole("row");
    const dataRows = rows.slice(1); // Skip header row
    expect(dataRows).toHaveLength(3);
    expect(screen.queryByText("Other account")).not.toBeInTheDocument();
  });

  it("shows next recurring occurrence in the list", async () => {
    const recurring: RecurringTransaction[] = [
      {
        id: "r1",
        accountId: "a1",
        amount: 5000,
        description: "Monthly Salary",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2024-01-15",
      },
    ];
    renderWithProvider("a1", [], recurring);

    expect(await screen.findByText("Monthly Salary")).toBeInTheDocument();
    expect(screen.getByText("Recurring")).toBeInTheDocument();
  });

  it("sorts recurring occurrence among regular transactions by date", async () => {
    // Use a date far in the future so the next occurrence is predictable
    const recurring: RecurringTransaction[] = [
      {
        id: "r1",
        accountId: "a1",
        amount: 5000,
        description: "Monthly Salary",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2099-06-15",
      },
    ];
    const txs: Transaction[] = [
      { id: "t1", accountId: "a1", amount: 100, date: "2099-07-01", description: "Future tx" },
    ];
    renderWithProvider("a1", txs, recurring);

    const rows = await screen.findAllByRole("row");
    const dataRows = rows.slice(1); // Skip header row
    expect(dataRows).toHaveLength(2);
    // Future tx (2099-07-01) is newer, so appears first
    expect(dataRows[0]).toHaveTextContent("Future tx");
    expect(dataRows[1]).toHaveTextContent("Monthly Salary");
  });

  it("shows edit button for recurring transaction", async () => {
    const recurring: RecurringTransaction[] = [
      {
        id: "r1",
        accountId: "a1",
        amount: 5000,
        description: "Monthly Salary",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2024-01-15",
      },
    ];
    renderWithProvider("a1", [], recurring);

    const editButton = await screen.findByLabelText("Edit Transaction");
    expect(editButton).toBeInTheDocument();
  });

  it("does not show ended recurring transaction", async () => {
    const recurring: RecurringTransaction[] = [
      {
        id: "r1",
        accountId: "a1",
        amount: 5000,
        description: "Expired Salary",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2020-01-15",
        endDate: "2020-06-01",
      },
    ];
    renderWithProvider("a1", [], recurring);

    expect(screen.getByText("No transactions yet.")).toBeInTheDocument();
  });

  it("does not show recurring transaction for a different account", async () => {
    const recurring: RecurringTransaction[] = [
      {
        id: "r1",
        accountId: "a2",
        amount: 5000,
        description: "Other Account Salary",
        frequency: RecurrenceFrequency.Monthly,
        startDate: "2024-01-15",
      },
    ];
    renderWithProvider("a1", [], recurring);

    expect(screen.getByText("No transactions yet.")).toBeInTheDocument();
  });

  it("shows Unknown for account name when account does not exist", async () => {
    const orphanTransactions: Transaction[] = [
      { id: "t1", accountId: "unknown-account", amount: 1000, date: "2024-01-15", description: "Orphan transaction" }
    ];
    renderWithProvider("unknown-account", orphanTransactions);

    expect(await screen.findByText("Unknown")).toBeInTheDocument();
  });

  it("shows scenario icon for transactions with a scenarioId", async () => {
    const scenarios: Scenario[] = [
      { id: "s1", name: "Early Retirement", description: "" },
    ];
    const scenarioTransactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: -30000, date: "2024-01-15", description: "New Car", scenarioId: "s1" },
    ];
    renderWithProvider("a1", scenarioTransactions, [], scenarios, "s1");

    expect(await screen.findByLabelText("Scenario: Early Retirement")).toBeInTheDocument();
  });

  it("does not show scenario icon for baseline transactions", async () => {
    const baselineTransactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: -200, date: "2024-01-15", description: "Groceries" },
    ];
    renderWithProvider("a1", baselineTransactions);

    await screen.findByText("Groceries");
    expect(screen.queryByLabelText(/^Scenario:/)).not.toBeInTheDocument();
  });

  it("does not show scenario icon when scenario was deleted", async () => {
    const orphanScenarioTransactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: -30000, date: "2024-01-15", description: "New Car", scenarioId: "deleted-scenario" },
    ];
    const dummyScenarios: Scenario[] = [
      { id: "dummy", name: "Dummy", description: "" },
    ];
    renderWithProvider("a1", orphanScenarioTransactions, [], dummyScenarios, "deleted-scenario");

    await screen.findByText("New Car");
    expect(screen.queryByLabelText(/^Scenario:/)).not.toBeInTheDocument();
  });

  it("shows only baseline transactions when activeScenarioId is null", async () => {
    const scenarios: Scenario[] = [
      { id: "s1", name: "Scenario 1", description: "" },
    ];
    const mixedTransactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: 100, date: "2024-01-15", description: "Baseline tx" },
      { id: "t2", accountId: "a1", amount: 200, date: "2024-01-16", description: "Scenario tx", scenarioId: "s1" },
    ];
    renderWithProvider("a1", mixedTransactions, [], scenarios, null);

    expect(await screen.findByText("Baseline tx")).toBeInTheDocument();
    expect(screen.queryByText("Scenario tx")).not.toBeInTheDocument();
  });

  it("shows baseline + scenario transactions when activeScenarioId is set", async () => {
    const scenarios: Scenario[] = [
      { id: "s1", name: "Scenario 1", description: "" },
      { id: "s2", name: "Scenario 2", description: "" },
    ];
    const mixedTransactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: 100, date: "2024-01-15", description: "Baseline tx" },
      { id: "t2", accountId: "a1", amount: 200, date: "2024-01-16", description: "Scenario 1 tx", scenarioId: "s1" },
      { id: "t3", accountId: "a1", amount: 300, date: "2024-01-17", description: "Scenario 2 tx", scenarioId: "s2" },
    ];
    renderWithProvider("a1", mixedTransactions, [], scenarios, "s1");

    expect(await screen.findByText("Baseline tx")).toBeInTheDocument();
    expect(screen.getByText("Scenario 1 tx")).toBeInTheDocument();
    expect(screen.queryByText("Scenario 2 tx")).not.toBeInTheDocument();
  });
});

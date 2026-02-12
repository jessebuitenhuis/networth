import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TransactionList } from "./TransactionList";
import type { Transaction } from "@/models/Transaction";
import type { RecurringTransaction } from "@/models/RecurringTransaction";
import { RecurrenceFrequency } from "@/models/RecurrenceFrequency";
import { AccountProvider } from "@/context/AccountContext";
import { TransactionProvider } from "@/context/TransactionContext";
import { ScenarioProvider } from "@/context/ScenarioContext";
import { RecurringTransactionProvider } from "@/context/RecurringTransactionContext";

const transactions: Transaction[] = [
  { id: "t1", accountId: "a1", amount: 1000, date: "2024-01-15", description: "Opening balance" },
  { id: "t2", accountId: "a1", amount: -200, date: "2024-01-20", description: "Groceries" },
  { id: "t3", accountId: "a1", amount: 500, date: "2024-01-18", description: "Salary" },
];

function renderWithProvider(
  accountId: string,
  initialTransactions: Transaction[] = [],
  initialRecurring: RecurringTransaction[] = []
) {
  localStorage.setItem("transactions", JSON.stringify(initialTransactions));
  localStorage.setItem(
    "recurringTransactions",
    JSON.stringify(initialRecurring)
  );
  return render(
    <AccountProvider>
      <TransactionProvider>
        <ScenarioProvider>
          <RecurringTransactionProvider>
            <TransactionList accountId={accountId} />
          </RecurringTransactionProvider>
        </ScenarioProvider>
      </TransactionProvider>
    </AccountProvider>
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
    expect(screen.getByText("1/15/2024")).toBeInTheDocument();
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
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { TransactionList } from "./TransactionList";
import type { Transaction } from "@/models/Transaction";
import { AccountProvider } from "@/context/AccountContext";
import { TransactionProvider } from "@/context/TransactionContext";

const transactions: Transaction[] = [
  { id: "t1", accountId: "a1", amount: 1000, date: "2024-01-15", description: "Opening balance" },
  { id: "t2", accountId: "a1", amount: -200, date: "2024-01-20", description: "Groceries" },
  { id: "t3", accountId: "a1", amount: 500, date: "2024-01-18", description: "Salary" },
];

function renderWithProvider(
  accountId: string,
  initialTransactions: Transaction[] = []
) {
  localStorage.setItem("transactions", JSON.stringify(initialTransactions));
  return render(
    <AccountProvider>
      <TransactionProvider>
        <TransactionList accountId={accountId} />
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

    const items = await screen.findAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("Groceries");
    expect(items[1]).toHaveTextContent("Salary");
    expect(items[2]).toHaveTextContent("Opening balance");
  });

  it("displays date, description, and formatted amount", async () => {
    renderWithProvider("a1", [transactions[0]]);

    expect(await screen.findByText("Opening balance")).toBeInTheDocument();
    expect(screen.getByText("1/15/2024")).toBeInTheDocument();
    expect(screen.getByText("+$1,000.00")).toBeInTheDocument();
  });

  it("shows positive amounts in green", async () => {
    renderWithProvider("a1", [transactions[0]]);

    const amount = await screen.findByText("+$1,000.00");
    expect(amount).toHaveClass("text-green-600");
  });

  it("shows negative amounts in red", async () => {
    renderWithProvider("a1", [transactions[1]]);

    const amount = await screen.findByText("-$200.00");
    expect(amount).toHaveClass("text-red-600");
  });

  it("removes transaction when delete button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProvider("a1", [transactions[0]]);

    const deleteButton = await screen.findByRole("button", { name: "Delete" });
    await user.click(deleteButton);

    expect(screen.getByText("No transactions yet.")).toBeInTheDocument();
  });

  it("renders future-dated transaction with dashed border", async () => {
    const futureTransactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: 1000, date: "2099-01-01", description: "Future tx" },
    ];
    renderWithProvider("a1", futureTransactions);

    const item = await screen.findByRole("listitem");
    const card = item.querySelector("[data-slot='card']");
    expect(card).toHaveClass("border-dashed");
  });

  it("only shows transactions for the given account", async () => {
    const mixedTransactions = [
      ...transactions,
      { id: "t4", accountId: "a2", amount: 9999, date: "2024-01-25", description: "Other account" },
    ];
    renderWithProvider("a1", mixedTransactions);

    const items = await screen.findAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(screen.queryByText("Other account")).not.toBeInTheDocument();
  });
});

import { render, screen, act } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  TransactionProvider,
  useTransactions,
  transactionReducer,
} from "./TransactionContext";
import type { Transaction } from "@/models/Transaction";

const tx1: Transaction = {
  id: "t1",
  accountId: "a1",
  amount: 1000,
  date: "2024-01-01",
  description: "Opening balance",
};

const tx2: Transaction = {
  id: "t2",
  accountId: "a1",
  amount: -200,
  date: "2024-01-02",
  description: "Groceries",
};

const tx3: Transaction = {
  id: "t3",
  accountId: "a2",
  amount: 500,
  date: "2024-01-01",
  description: "Other account",
};

describe("transactionReducer", () => {
  it("adds a transaction", () => {
    const result = transactionReducer([], { type: "add", transaction: tx1 });
    expect(result).toEqual([tx1]);
  });

  it("removes a transaction by id", () => {
    const result = transactionReducer([tx1, tx2], { type: "remove", id: "t1" });
    expect(result).toEqual([tx2]);
  });

  it("sets transactions list", () => {
    const result = transactionReducer([], {
      type: "set",
      transactions: [tx1, tx2],
    });
    expect(result).toEqual([tx1, tx2]);
  });

  it("removes all transactions by accountId", () => {
    const result = transactionReducer([tx1, tx2, tx3], {
      type: "removeByAccountId",
      accountId: "a1",
    });
    expect(result).toEqual([tx3]);
  });

  it("updates a transaction", () => {
    const updated: Transaction = {
      ...tx1,
      amount: 1500,
      description: "Updated opening balance",
    };
    const result = transactionReducer([tx1, tx2], {
      type: "update",
      transaction: updated,
    });
    expect(result).toEqual([updated, tx2]);
  });
});

function TestConsumer() {
  const { transactions, addTransaction, removeTransaction, removeTransactionsByAccountId, updateTransaction, getBalance } =
    useTransactions();
  return (
    <div>
      <span data-testid="count">{transactions.length}</span>
      <span data-testid="balance">{getBalance("a1")}</span>
      <button onClick={() => addTransaction(tx1)}>Add</button>
      <button onClick={() => removeTransaction("t1")}>Remove</button>
      <button onClick={() => removeTransactionsByAccountId("a1")}>Remove By Account</button>
      <button onClick={() => updateTransaction({ ...tx1, amount: 1500, description: "Updated" })}>Update</button>
      {transactions.map((t) => (
        <span key={t.id}>{t.description}</span>
      ))}
    </div>
  );
}

describe("TransactionProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with empty transactions", () => {
    render(
      <TransactionProvider>
        <TestConsumer />
      </TransactionProvider>
    );
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("loads transactions from localStorage on mount", async () => {
    localStorage.setItem("transactions", JSON.stringify([tx1]));

    render(
      <TransactionProvider>
        <TestConsumer />
      </TransactionProvider>
    );

    expect(await screen.findByText("Opening balance")).toBeInTheDocument();
  });

  it("adds a transaction", () => {
    render(
      <TransactionProvider>
        <TestConsumer />
      </TransactionProvider>
    );

    act(() => screen.getByText("Add").click());

    expect(screen.getByText("Opening balance")).toBeInTheDocument();
    expect(screen.getByTestId("count")).toHaveTextContent("1");
  });

  it("removes a transaction", () => {
    localStorage.setItem("transactions", JSON.stringify([tx1]));

    render(
      <TransactionProvider>
        <TestConsumer />
      </TransactionProvider>
    );

    act(() => screen.getByText("Remove").click());

    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("computes balance for an account", () => {
    localStorage.setItem("transactions", JSON.stringify([tx1, tx2]));

    render(
      <TransactionProvider>
        <TestConsumer />
      </TransactionProvider>
    );

    act(() => {}); // flush effects

    expect(screen.getByTestId("balance")).toHaveTextContent("800");
  });

  it("persists transactions to localStorage on change", () => {
    render(
      <TransactionProvider>
        <TestConsumer />
      </TransactionProvider>
    );

    act(() => screen.getByText("Add").click());

    const stored = JSON.parse(localStorage.getItem("transactions")!);
    expect(stored).toEqual([tx1]);
  });

  it("excludes future transactions from getBalance", () => {
    const futureTx: Transaction = {
      id: "t-future",
      accountId: "a1",
      amount: 9999,
      date: "2099-01-01",
      description: "Future",
    };
    localStorage.setItem("transactions", JSON.stringify([tx1, futureTx]));

    render(
      <TransactionProvider>
        <TestConsumer />
      </TransactionProvider>
    );

    act(() => {});

    expect(screen.getByTestId("balance")).toHaveTextContent("1000");
  });

  it("removes all transactions for an account", () => {
    localStorage.setItem("transactions", JSON.stringify([tx1, tx2, tx3]));

    render(
      <TransactionProvider>
        <TestConsumer />
      </TransactionProvider>
    );

    act(() => screen.getByText("Remove By Account").click());

    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(screen.getByText("Other account")).toBeInTheDocument();
    expect(screen.queryByText("Opening balance")).not.toBeInTheDocument();
    expect(screen.queryByText("Groceries")).not.toBeInTheDocument();
  });

  it("updates a transaction", () => {
    localStorage.setItem("transactions", JSON.stringify([tx1, tx2]));

    render(
      <TransactionProvider>
        <TestConsumer />
      </TransactionProvider>
    );

    act(() => screen.getByText("Update").click());

    expect(screen.getByText("Updated")).toBeInTheDocument();
    expect(screen.queryByText("Opening balance")).not.toBeInTheDocument();
    expect(screen.getByTestId("count")).toHaveTextContent("2");
  });

  it("throws when useTransactions is called outside provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useTransactions must be used within TransactionProvider"
    );
    spy.mockRestore();
  });
});

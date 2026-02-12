import { render, screen, act } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  RecurringTransactionProvider,
  useRecurringTransactions,
  recurringTransactionReducer,
} from "./RecurringTransactionContext";
import { RecurrenceFrequency } from "@/models/RecurrenceFrequency.type";
import type { RecurringTransaction } from "@/models/RecurringTransaction.type";

const rt1: RecurringTransaction = {
  id: "r1",
  accountId: "a1",
  amount: 5000,
  description: "Salary",
  frequency: RecurrenceFrequency.Monthly,
  startDate: "2024-01-15",
};

const rt2: RecurringTransaction = {
  id: "r2",
  accountId: "a1",
  amount: -1200,
  description: "Rent",
  frequency: RecurrenceFrequency.Monthly,
  startDate: "2024-01-01",
};

describe("recurringTransactionReducer", () => {
  it("adds a recurring transaction", () => {
    const result = recurringTransactionReducer([], {
      type: "add",
      recurringTransaction: rt1,
    });
    expect(result).toEqual([rt1]);
  });

  it("removes a recurring transaction by id", () => {
    const result = recurringTransactionReducer([rt1, rt2], {
      type: "remove",
      id: "r1",
    });
    expect(result).toEqual([rt2]);
  });

  it("sets recurring transactions list", () => {
    const result = recurringTransactionReducer([], {
      type: "set",
      recurringTransactions: [rt1, rt2],
    });
    expect(result).toEqual([rt1, rt2]);
  });

  it("updates a recurring transaction", () => {
    const updated: RecurringTransaction = {
      ...rt1,
      amount: 6000,
      description: "Updated salary",
    };
    const result = recurringTransactionReducer([rt1, rt2], {
      type: "update",
      recurringTransaction: updated,
    });
    expect(result).toEqual([updated, rt2]);
  });
});

function TestConsumer() {
  const {
    recurringTransactions,
    addRecurringTransaction,
    removeRecurringTransaction,
    updateRecurringTransaction,
  } = useRecurringTransactions();
  return (
    <div>
      <span data-testid="count">{recurringTransactions.length}</span>
      <button onClick={() => addRecurringTransaction(rt1)}>Add</button>
      <button onClick={() => removeRecurringTransaction("r1")}>Remove</button>
      <button onClick={() => updateRecurringTransaction({ ...rt1, amount: 6000, description: "Updated" })}>Update</button>
      {recurringTransactions.map((rt) => (
        <span key={rt.id}>{rt.description}</span>
      ))}
    </div>
  );
}

describe("RecurringTransactionProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with empty recurring transactions", () => {
    render(
      <RecurringTransactionProvider>
        <TestConsumer />
      </RecurringTransactionProvider>
    );
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("loads recurring transactions from localStorage on mount", async () => {
    localStorage.setItem(
      "recurringTransactions",
      JSON.stringify([rt1])
    );

    render(
      <RecurringTransactionProvider>
        <TestConsumer />
      </RecurringTransactionProvider>
    );

    expect(await screen.findByText("Salary")).toBeInTheDocument();
  });

  it("adds a recurring transaction", () => {
    render(
      <RecurringTransactionProvider>
        <TestConsumer />
      </RecurringTransactionProvider>
    );

    act(() => screen.getByText("Add").click());

    expect(screen.getByText("Salary")).toBeInTheDocument();
    expect(screen.getByTestId("count")).toHaveTextContent("1");
  });

  it("removes a recurring transaction", () => {
    localStorage.setItem(
      "recurringTransactions",
      JSON.stringify([rt1])
    );

    render(
      <RecurringTransactionProvider>
        <TestConsumer />
      </RecurringTransactionProvider>
    );

    act(() => screen.getByText("Remove").click());

    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("persists recurring transactions to localStorage on change", () => {
    render(
      <RecurringTransactionProvider>
        <TestConsumer />
      </RecurringTransactionProvider>
    );

    act(() => screen.getByText("Add").click());

    const stored = JSON.parse(
      localStorage.getItem("recurringTransactions")!
    );
    expect(stored).toEqual([rt1]);
  });

  it("updates a recurring transaction", () => {
    localStorage.setItem("recurringTransactions", JSON.stringify([rt1, rt2]));

    render(
      <RecurringTransactionProvider>
        <TestConsumer />
      </RecurringTransactionProvider>
    );

    act(() => screen.getByText("Update").click());

    expect(screen.getByText("Updated")).toBeInTheDocument();
    expect(screen.queryByText("Salary")).not.toBeInTheDocument();
    expect(screen.getByTestId("count")).toHaveTextContent("2");
  });

  it("throws when useRecurringTransactions is called outside provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useRecurringTransactions must be used within RecurringTransactionProvider"
    );
    spy.mockRestore();
  });
});

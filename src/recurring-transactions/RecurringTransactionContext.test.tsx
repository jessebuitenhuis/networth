import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RecurrenceFrequency } from "@/recurring-transactions/RecurrenceFrequency";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";

import {
  RecurringTransactionProvider,
  recurringTransactionReducer,
  useRecurringTransactions,
} from "./RecurringTransactionContext";

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

const rt3: RecurringTransaction = {
  id: "r3",
  accountId: "a2",
  amount: 300,
  description: "Scenario income",
  frequency: RecurrenceFrequency.Monthly,
  startDate: "2024-01-01",
  scenarioId: "s1",
};

const rt4: RecurringTransaction = {
  id: "r4",
  accountId: "a1",
  amount: -500,
  description: "Scenario expense",
  frequency: RecurrenceFrequency.Monthly,
  startDate: "2024-01-01",
  scenarioId: "s1",
};

const mockFetch = vi.fn();

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

  it("removes all recurring transactions by scenarioId", () => {
    const result = recurringTransactionReducer([rt1, rt2, rt3, rt4], {
      type: "removeByScenarioId",
      scenarioId: "s1",
    });
    expect(result).toEqual([rt1, rt2]);
  });
});

function TestConsumer() {
  const {
    recurringTransactions,
    addRecurringTransaction,
    removeRecurringTransaction,
    removeRecurringTransactionsByScenarioId,
    updateRecurringTransaction,
  } = useRecurringTransactions();
  return (
    <div>
      <span data-testid="count">{recurringTransactions.length}</span>
      <button onClick={() => addRecurringTransaction(rt1)}>Add</button>
      <button onClick={() => removeRecurringTransaction("r1")}>Remove</button>
      <button onClick={() => removeRecurringTransactionsByScenarioId("s1")}>
        Remove By Scenario
      </button>
      <button
        onClick={() =>
          updateRecurringTransaction({
            ...rt1,
            amount: 6000,
            description: "Updated",
          })
        }
      >
        Update
      </button>
      {recurringTransactions.map((rt) => (
        <span key={rt.id}>{rt.description}</span>
      ))}
    </div>
  );
}

describe("RecurringTransactionProvider", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  it("fetches recurring transactions from API on mount", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [rt1],
    });

    render(
      <RecurringTransactionProvider>
        <TestConsumer />
      </RecurringTransactionProvider>,
    );

    expect(await screen.findByText("Salary")).toBeInTheDocument();
    expect(mockFetch).toHaveBeenCalledWith("/api/recurring-transactions");
  });

  it("starts with empty recurring transactions before API responds", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));

    render(
      <RecurringTransactionProvider>
        <TestConsumer />
      </RecurringTransactionProvider>,
    );

    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("calls POST /api/recurring-transactions on add", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => rt1 });

    render(
      <RecurringTransactionProvider>
        <TestConsumer />
      </RecurringTransactionProvider>,
    );

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith("/api/recurring-transactions"),
    );

    await act(async () => screen.getByText("Add").click());

    expect(mockFetch).toHaveBeenCalledWith("/api/recurring-transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rt1),
    });
    expect(screen.getByText("Salary")).toBeInTheDocument();
    expect(screen.getByTestId("count")).toHaveTextContent("1");
  });

  it("calls DELETE /api/recurring-transactions/:id on remove", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => [rt1] })
      .mockResolvedValueOnce({ ok: true });

    render(
      <RecurringTransactionProvider>
        <TestConsumer />
      </RecurringTransactionProvider>,
    );

    await screen.findByText("Salary");

    await act(async () => screen.getByText("Remove").click());

    expect(mockFetch).toHaveBeenCalledWith("/api/recurring-transactions/r1", {
      method: "DELETE",
    });
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("calls PUT /api/recurring-transactions/:id on update", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => [rt1, rt2] })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...rt1, amount: 6000, description: "Updated" }),
      });

    render(
      <RecurringTransactionProvider>
        <TestConsumer />
      </RecurringTransactionProvider>,
    );

    await screen.findByText("Salary");

    await act(async () => screen.getByText("Update").click());

    const updated = { ...rt1, amount: 6000, description: "Updated" };
    expect(mockFetch).toHaveBeenCalledWith("/api/recurring-transactions/r1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    expect(screen.getByText("Updated")).toBeInTheDocument();
    expect(screen.queryByText("Salary")).not.toBeInTheDocument();
    expect(screen.getByTestId("count")).toHaveTextContent("2");
  });

  it("calls DELETE /api/recurring-transactions?scenarioId on remove by scenario", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [rt1, rt2, rt3, rt4],
      })
      .mockResolvedValueOnce({ ok: true });

    render(
      <RecurringTransactionProvider>
        <TestConsumer />
      </RecurringTransactionProvider>,
    );

    await screen.findByText("Salary");

    await act(async () => screen.getByText("Remove By Scenario").click());

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/recurring-transactions?scenarioId=s1",
      { method: "DELETE" },
    );
    expect(screen.getByTestId("count")).toHaveTextContent("2");
    expect(screen.getByText("Salary")).toBeInTheDocument();
    expect(screen.getByText("Rent")).toBeInTheDocument();
    expect(screen.queryByText("Scenario income")).not.toBeInTheDocument();
    expect(screen.queryByText("Scenario expense")).not.toBeInTheDocument();
  });

  it("throws when useRecurringTransactions is called outside provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useRecurringTransactions must be used within RecurringTransactionProvider",
    );
    spy.mockRestore();
  });
});

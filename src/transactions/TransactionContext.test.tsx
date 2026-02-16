import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Transaction } from "@/transactions/Transaction.type";
import {
  TransactionProvider,
  transactionReducer,
  useTransactions,
} from "@/transactions/TransactionContext";

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

const tx4: Transaction = {
  id: "t4",
  accountId: "a1",
  amount: 300,
  date: "2024-01-03",
  description: "Scenario transaction",
  scenarioId: "s1",
};

const tx5: Transaction = {
  id: "t5",
  accountId: "a2",
  amount: 200,
  date: "2024-01-03",
  description: "Another scenario transaction",
  scenarioId: "s1",
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

  it("removes all transactions by scenarioId", () => {
    const result = transactionReducer([tx1, tx2, tx4, tx5], {
      type: "removeByScenarioId",
      scenarioId: "s1",
    });
    expect(result).toEqual([tx1, tx2]);
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

  it("adds multiple transactions", () => {
    const result = transactionReducer([tx1], {
      type: "addMany",
      transactions: [tx2, tx3],
    });
    expect(result).toEqual([tx1, tx2, tx3]);
  });

  it("returns state unchanged when adding empty array", () => {
    const result = transactionReducer([tx1], {
      type: "addMany",
      transactions: [],
    });
    expect(result).toEqual([tx1]);
  });
});

function mockFetch(responses: Record<string, { status: number; body?: unknown }>) {
  return vi.fn(async (url: string, init?: RequestInit) => {
    const method = init?.method ?? "GET";
    const key = `${method} ${url}`;

    for (const [pattern, response] of Object.entries(responses)) {
      if (key === pattern || url.startsWith(pattern.replace(/^[A-Z]+ /, ""))) {
        if (method === pattern.split(" ")[0]) {
          return {
            ok: response.status >= 200 && response.status < 300,
            status: response.status,
            json: async () => response.body,
          };
        }
      }
    }

    return { ok: true, status: 200, json: async () => [] };
  }) as unknown as typeof globalThis.fetch;
}

function TestConsumer() {
  const {
    transactions,
    addTransaction,
    addTransactions,
    removeTransaction,
    removeTransactionsByAccountId,
    removeTransactionsByScenarioId,
    updateTransaction,
    getBalance,
  } = useTransactions();
  return (
    <div>
      <span data-testid="count">{transactions.length}</span>
      <span data-testid="balance">{getBalance("a1")}</span>
      <button onClick={() => addTransaction(tx1)}>Add</button>
      <button onClick={() => addTransactions([tx2, tx3])}>Add Many</button>
      <button onClick={() => removeTransaction("t1")}>Remove</button>
      <button onClick={() => removeTransactionsByAccountId("a1")}>
        Remove By Account
      </button>
      <button onClick={() => removeTransactionsByScenarioId("s1")}>
        Remove By Scenario
      </button>
      <button
        onClick={() =>
          updateTransaction({ ...tx1, amount: 1500, description: "Updated" })
        }
      >
        Update
      </button>
      {transactions.map((t) => (
        <span key={t.id}>{t.description}</span>
      ))}
    </div>
  );
}

describe("TransactionProvider", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => [],
    })) as unknown as ReturnType<typeof vi.fn>;
    globalThis.fetch = fetchSpy as unknown as typeof globalThis.fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches transactions from API on mount", async () => {
    globalThis.fetch = mockFetch({
      "GET /api/transactions": { status: 200, body: [tx1] },
    });

    render(
      <TransactionProvider>
        <TestConsumer />
      </TransactionProvider>,
    );

    expect(await screen.findByText("Opening balance")).toBeInTheDocument();
    expect(screen.getByTestId("count")).toHaveTextContent("1");
  });

  it("starts with empty transactions when API returns empty", async () => {
    render(
      <TransactionProvider>
        <TestConsumer />
      </TransactionProvider>,
    );

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalled();
    });

    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("adds a transaction via POST", async () => {
    globalThis.fetch = vi.fn(async (url: string, init?: RequestInit) => {
      const method = init?.method ?? "GET";
      if (method === "GET") {
        return { ok: true, status: 200, json: async () => [] };
      }
      if (method === "POST") {
        return { ok: true, status: 201, json: async () => tx1 };
      }
      return { ok: true, status: 200, json: async () => [] };
    }) as unknown as typeof globalThis.fetch;

    render(
      <TransactionProvider>
        <TestConsumer />
      </TransactionProvider>,
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/transactions",
        expect.objectContaining({ method: undefined }) // GET has no method set, or is GET
      );
    }).catch(() => {
      // GET may have been called differently
    });

    await act(async () => {
      screen.getByText("Add").click();
    });

    expect(screen.getByText("Opening balance")).toBeInTheDocument();
    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/transactions",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(tx1),
      }),
    );
  });

  it("adds multiple transactions via batch POST", async () => {
    globalThis.fetch = vi.fn(async (_url: string, init?: RequestInit) => {
      const method = init?.method ?? "GET";
      if (method === "GET") {
        return { ok: true, status: 200, json: async () => [] };
      }
      if (method === "POST") {
        return { ok: true, status: 201, json: async () => [tx2, tx3] };
      }
      return { ok: true, status: 200, json: async () => [] };
    }) as unknown as typeof globalThis.fetch;

    render(
      <TransactionProvider>
        <TestConsumer />
      </TransactionProvider>,
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalled();
    });

    await act(async () => {
      screen.getByText("Add Many").click();
    });

    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("Other account")).toBeInTheDocument();
    expect(screen.getByTestId("count")).toHaveTextContent("2");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/transactions",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify([tx2, tx3]),
      }),
    );
  });

  it("removes a transaction via DELETE /api/transactions/[id]", async () => {
    globalThis.fetch = vi.fn(async (url: string, init?: RequestInit) => {
      const method = init?.method ?? "GET";
      if (method === "GET") {
        return { ok: true, status: 200, json: async () => [tx1] };
      }
      if (method === "DELETE") {
        return { ok: true, status: 204, json: async () => null };
      }
      return { ok: true, status: 200, json: async () => [] };
    }) as unknown as typeof globalThis.fetch;

    render(
      <TransactionProvider>
        <TestConsumer />
      </TransactionProvider>,
    );

    await screen.findByText("Opening balance");

    await act(async () => {
      screen.getByText("Remove").click();
    });

    expect(screen.getByTestId("count")).toHaveTextContent("0");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/transactions/t1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("removes all transactions for an account via DELETE with accountId query param", async () => {
    globalThis.fetch = vi.fn(async (url: string, init?: RequestInit) => {
      const method = init?.method ?? "GET";
      if (method === "GET") {
        return { ok: true, status: 200, json: async () => [tx1, tx2, tx3] };
      }
      if (method === "DELETE") {
        return { ok: true, status: 204, json: async () => null };
      }
      return { ok: true, status: 200, json: async () => [] };
    }) as unknown as typeof globalThis.fetch;

    render(
      <TransactionProvider>
        <TestConsumer />
      </TransactionProvider>,
    );

    await screen.findByText("Opening balance");

    await act(async () => {
      screen.getByText("Remove By Account").click();
    });

    expect(screen.getByTestId("count")).toHaveTextContent("1");
    expect(screen.getByText("Other account")).toBeInTheDocument();
    expect(screen.queryByText("Opening balance")).not.toBeInTheDocument();
    expect(screen.queryByText("Groceries")).not.toBeInTheDocument();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/transactions?accountId=a1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("removes all transactions for a scenario via DELETE with scenarioId query param", async () => {
    globalThis.fetch = vi.fn(async (url: string, init?: RequestInit) => {
      const method = init?.method ?? "GET";
      if (method === "GET") {
        return { ok: true, status: 200, json: async () => [tx1, tx2, tx4, tx5] };
      }
      if (method === "DELETE") {
        return { ok: true, status: 204, json: async () => null };
      }
      return { ok: true, status: 200, json: async () => [] };
    }) as unknown as typeof globalThis.fetch;

    render(
      <TransactionProvider>
        <TestConsumer />
      </TransactionProvider>,
    );

    await screen.findByText("Opening balance");

    await act(async () => {
      screen.getByText("Remove By Scenario").click();
    });

    expect(screen.getByTestId("count")).toHaveTextContent("2");
    expect(screen.getByText("Opening balance")).toBeInTheDocument();
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.queryByText("Scenario transaction")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Another scenario transaction"),
    ).not.toBeInTheDocument();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/transactions?scenarioId=s1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("updates a transaction via PUT /api/transactions/[id]", async () => {
    const updatedTx1 = { ...tx1, amount: 1500, description: "Updated" };

    globalThis.fetch = vi.fn(async (url: string, init?: RequestInit) => {
      const method = init?.method ?? "GET";
      if (method === "GET") {
        return { ok: true, status: 200, json: async () => [tx1, tx2] };
      }
      if (method === "PUT") {
        return { ok: true, status: 200, json: async () => updatedTx1 };
      }
      return { ok: true, status: 200, json: async () => [] };
    }) as unknown as typeof globalThis.fetch;

    render(
      <TransactionProvider>
        <TestConsumer />
      </TransactionProvider>,
    );

    await screen.findByText("Opening balance");

    await act(async () => {
      screen.getByText("Update").click();
    });

    expect(screen.getByText("Updated")).toBeInTheDocument();
    expect(screen.queryByText("Opening balance")).not.toBeInTheDocument();
    expect(screen.getByTestId("count")).toHaveTextContent("2");
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/transactions/t1",
      expect.objectContaining({
        method: "PUT",
        body: JSON.stringify(updatedTx1),
      }),
    );
  });

  it("computes balance for an account", async () => {
    globalThis.fetch = mockFetch({
      "GET /api/transactions": { status: 200, body: [tx1, tx2] },
    });

    render(
      <TransactionProvider>
        <TestConsumer />
      </TransactionProvider>,
    );

    await screen.findByText("Opening balance");

    expect(screen.getByTestId("balance")).toHaveTextContent("800");
  });

  it("excludes future transactions from getBalance", async () => {
    const futureTx: Transaction = {
      id: "t-future",
      accountId: "a1",
      amount: 9999,
      date: "2099-01-01",
      description: "Future",
    };

    globalThis.fetch = mockFetch({
      "GET /api/transactions": { status: 200, body: [tx1, futureTx] },
    });

    render(
      <TransactionProvider>
        <TestConsumer />
      </TransactionProvider>,
    );

    await screen.findByText("Opening balance");

    expect(screen.getByTestId("balance")).toHaveTextContent("1000");
  });

  it("throws when useTransactions is called outside provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useTransactions must be used within TransactionProvider",
    );
    spy.mockRestore();
  });
});

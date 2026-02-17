import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/transactions/transactionRepository");

const {
  getAllTransactions,
  createTransaction,
  createTransactions,
  deleteTransactionsByAccountId,
  deleteTransactionsByScenarioId,
} = await import("@/transactions/transactionRepository");
const { GET, POST, DELETE } = await import("./route");

beforeEach(() => {
  vi.resetAllMocks();
});

describe("GET /api/transactions", () => {
  it("returns empty array when no transactions exist", async () => {
    vi.mocked(getAllTransactions).mockReturnValue([]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });

  it("returns all transactions", async () => {
    vi.mocked(getAllTransactions).mockReturnValue([
      { id: "t-1", accountId: "acc-1", amount: 100, date: "2025-01-01", description: "Deposit", isProjected: null, scenarioId: null },
      { id: "t-2", accountId: "acc-1", amount: -50, date: "2025-01-15", description: "Withdrawal", isProjected: null, scenarioId: null },
    ]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(2);
  });

  it("returns transactions with optional fields", async () => {
    vi.mocked(getAllTransactions).mockReturnValue([
      { id: "t-1", accountId: "acc-1", amount: 200, date: "2025-06-01", description: "Projected", isProjected: true, scenarioId: "scenario-1" },
    ]);

    const response = await GET();
    const body = await response.json();

    expect(body[0].isProjected).toBe(true);
    expect(body[0].scenarioId).toBe("scenario-1");
  });
});

describe("POST /api/transactions", () => {
  it("creates a single transaction", async () => {
    vi.mocked(createTransaction).mockReturnValue({
      id: "t-new",
      accountId: "acc-1",
      amount: 500,
      date: "2025-03-01",
      description: "Paycheck",
      isProjected: null,
      scenarioId: null,
    });

    const request = new Request("http://localhost/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "t-new", accountId: "acc-1", amount: 500, date: "2025-03-01", description: "Paycheck" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual(expect.objectContaining({ id: "t-new", amount: 500 }));
  });

  it("creates a batch of transactions", async () => {
    vi.mocked(createTransactions).mockReturnValue([
      { id: "t-b1", accountId: "acc-1", amount: 100, date: "2025-01-01", description: "Batch 1", isProjected: null, scenarioId: null },
      { id: "t-b2", accountId: "acc-1", amount: 200, date: "2025-01-02", description: "Batch 2", isProjected: null, scenarioId: null },
    ]);

    const request = new Request("http://localhost/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([
        { id: "t-b1", accountId: "acc-1", amount: 100, date: "2025-01-01", description: "Batch 1" },
        { id: "t-b2", accountId: "acc-1", amount: 200, date: "2025-01-02", description: "Batch 2" },
      ]),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toHaveLength(2);
  });

  it("returns 400 for missing required fields", async () => {
    const request = new Request("http://localhost/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 100 }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});

describe("DELETE /api/transactions (bulk)", () => {
  it("deletes transactions by accountId", async () => {
    const url = "http://localhost/api/transactions?accountId=acc-1";
    const request = new Request(url, { method: "DELETE" });

    const response = await DELETE(request);

    expect(response.status).toBe(204);
    expect(deleteTransactionsByAccountId).toHaveBeenCalledWith("acc-1");
  });

  it("deletes transactions by scenarioId", async () => {
    const url = "http://localhost/api/transactions?scenarioId=s-1";
    const request = new Request(url, { method: "DELETE" });

    const response = await DELETE(request);

    expect(response.status).toBe(204);
    expect(deleteTransactionsByScenarioId).toHaveBeenCalledWith("s-1");
  });

  it("returns 400 when no filter provided", async () => {
    const request = new Request("http://localhost/api/transactions", {
      method: "DELETE",
    });

    const response = await DELETE(request);

    expect(response.status).toBe(400);
  });
});

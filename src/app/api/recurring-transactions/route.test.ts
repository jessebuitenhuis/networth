import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/recurring-transactions/recurringTransactionRepository");

const {
  getAllRecurringTransactions,
  createRecurringTransaction,
  deleteRecurringTransactionsByScenarioId,
} = await import("@/recurring-transactions/recurringTransactionRepository");
const { GET, POST, DELETE } = await import("./route");

beforeEach(() => {
  vi.resetAllMocks();
});

describe("GET /api/recurring-transactions", () => {
  it("returns empty array when none exist", async () => {
    vi.mocked(getAllRecurringTransactions).mockReturnValue([]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });

  it("returns all recurring transactions", async () => {
    vi.mocked(getAllRecurringTransactions).mockReturnValue([
      { id: "rt-1", accountId: "acc-1", amount: 3000, description: "Salary", frequency: "Monthly", startDate: "2025-01-01", endDate: null, scenarioId: null, categoryId: null },
      { id: "rt-2", accountId: "acc-1", amount: -1200, description: "Rent", frequency: "Monthly", startDate: "2025-01-01", endDate: null, scenarioId: null, categoryId: null },
    ]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(2);
  });

  it("returns recurring transactions with optional fields", async () => {
    vi.mocked(getAllRecurringTransactions).mockReturnValue([
      { id: "rt-1", accountId: "acc-1", amount: 500, description: "Bonus", frequency: "Yearly", startDate: "2025-01-01", endDate: "2027-01-01", scenarioId: "s-1", categoryId: null },
    ]);

    const response = await GET();
    const body = await response.json();

    expect(body[0].endDate).toBe("2027-01-01");
    expect(body[0].scenarioId).toBe("s-1");
  });
});

describe("POST /api/recurring-transactions", () => {
  it("creates a recurring transaction", async () => {
    vi.mocked(createRecurringTransaction).mockReturnValue({
      id: "rt-new",
      accountId: "acc-1",
      amount: 2000,
      description: "Paycheck",
      frequency: "Monthly",
      startDate: "2025-02-01",
      endDate: null,
      scenarioId: null,
      categoryId: null,
    });

    const request = new Request("http://localhost/api/recurring-transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "rt-new", accountId: "acc-1", amount: 2000, description: "Paycheck", frequency: "Monthly", startDate: "2025-02-01" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual(expect.objectContaining({ id: "rt-new", amount: 2000 }));
  });

  it("returns 400 for missing required fields", async () => {
    const request = new Request("http://localhost/api/recurring-transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 100 }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});

describe("DELETE /api/recurring-transactions (bulk)", () => {
  it("deletes recurring transactions by scenarioId", async () => {
    const url = "http://localhost/api/recurring-transactions?scenarioId=s-1";
    const request = new Request(url, { method: "DELETE" });

    const response = await DELETE(request);

    expect(response.status).toBe(204);
    expect(deleteRecurringTransactionsByScenarioId).toHaveBeenCalledWith("s-1");
  });

  it("returns 400 when no filter provided", async () => {
    const request = new Request("http://localhost/api/recurring-transactions", {
      method: "DELETE",
    });

    const response = await DELETE(request);

    expect(response.status).toBe(400);
  });
});

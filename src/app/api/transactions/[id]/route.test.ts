import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth/getCurrentUserId", () => ({ getCurrentUserId: vi.fn().mockResolvedValue("test-user") }));
vi.mock("@/transactions/transactionRepository");

const { getCurrentUserId } = await import("@/auth/getCurrentUserId");
const { getTransactionById, updateTransaction, deleteTransaction } =
  await import("@/transactions/transactionRepository");
const { PUT, DELETE } = await import("./route");

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(getCurrentUserId).mockResolvedValue("test-user");
});

describe("PUT /api/transactions/[id]", () => {
  it("updates an existing transaction", async () => {
    vi.mocked(getTransactionById).mockReturnValue({
      id: "t-1",
      accountId: "acc-1",
      amount: 100,
      date: "2025-01-01",
      description: "Initial",
      isProjected: null,
      scenarioId: null,
      categoryId: null,
    });
    vi.mocked(updateTransaction).mockReturnValue({
      id: "t-1",
      accountId: "acc-1",
      amount: 250,
      date: "2025-01-01",
      description: "Updated",
      isProjected: null,
      scenarioId: null,
      categoryId: null,
    });

    const request = new Request("http://localhost/api/transactions/t-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId: "acc-1", amount: 250, date: "2025-01-01", description: "Updated" }),
    });

    const response = await PUT(request, makeParams("t-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.amount).toBe(250);
    expect(body.description).toBe("Updated");
  });

  it("returns 404 for non-existent transaction", async () => {
    vi.mocked(getTransactionById).mockReturnValue(undefined);

    const request = new Request("http://localhost/api/transactions/missing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId: "acc-1", amount: 100, date: "2025-01-01", description: "Ghost" }),
    });

    const response = await PUT(request, makeParams("missing"));

    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/transactions/[id]", () => {
  it("deletes an existing transaction", async () => {
    vi.mocked(getTransactionById).mockReturnValue({
      id: "t-1",
      accountId: "acc-1",
      amount: 100,
      date: "2025-01-01",
      description: "Initial",
      isProjected: null,
      scenarioId: null,
      categoryId: null,
    });

    const response = await DELETE(
      new Request("http://localhost/api/transactions/t-1", { method: "DELETE" }),
      makeParams("t-1"),
    );

    expect(response.status).toBe(204);
    expect(deleteTransaction).toHaveBeenCalledWith("test-user", "t-1");
  });

  it("returns 404 for non-existent transaction", async () => {
    vi.mocked(getTransactionById).mockReturnValue(undefined);

    const response = await DELETE(
      new Request("http://localhost/api/transactions/missing", { method: "DELETE" }),
      makeParams("missing"),
    );

    expect(response.status).toBe(404);
  });
});

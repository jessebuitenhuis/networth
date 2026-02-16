import { beforeEach, describe, expect, it, vi } from "vitest";

import { recurringTransactions } from "@/db/schema";
import { createTestDb } from "@/test/createTestDb";

const testDb = createTestDb();

vi.mock("@/db/connection", () => ({ db: testDb }));

const { PUT, DELETE } = await import("./route");

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  testDb.delete(recurringTransactions).run();
  testDb
    .insert(recurringTransactions)
    .values({
      id: "rt-1",
      accountId: "acc-1",
      amount: 3000,
      description: "Salary",
      frequency: "Monthly",
      startDate: "2025-01-01",
    })
    .run();
});

describe("PUT /api/recurring-transactions/[id]", () => {
  it("updates an existing recurring transaction", async () => {
    const request = new Request(
      "http://localhost/api/recurring-transactions/rt-1",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: "acc-1",
          amount: 3500,
          description: "Salary (raise)",
          frequency: "Monthly",
          startDate: "2025-01-01",
        }),
      },
    );

    const response = await PUT(request, makeParams("rt-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.amount).toBe(3500);
    expect(body.description).toBe("Salary (raise)");
  });

  it("returns 404 for non-existent recurring transaction", async () => {
    const request = new Request(
      "http://localhost/api/recurring-transactions/missing",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: "acc-1",
          amount: 100,
          description: "Ghost",
          frequency: "Monthly",
          startDate: "2025-01-01",
        }),
      },
    );

    const response = await PUT(request, makeParams("missing"));

    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/recurring-transactions/[id]", () => {
  it("deletes an existing recurring transaction", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/recurring-transactions/rt-1", {
        method: "DELETE",
      }),
      makeParams("rt-1"),
    );

    expect(response.status).toBe(204);

    const rows = testDb.select().from(recurringTransactions).all();
    expect(rows).toHaveLength(0);
  });

  it("returns 404 for non-existent recurring transaction", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/recurring-transactions/missing", {
        method: "DELETE",
      }),
      makeParams("missing"),
    );

    expect(response.status).toBe(404);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

import { accounts, transactions } from "@/db/schema";
import { createTestDb } from "@/test/createTestDb";

const testDb = createTestDb();

vi.mock("@/db/connection", () => ({ db: testDb }));

const { PUT, DELETE } = await import("./route");

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  testDb.delete(transactions).run();
  testDb.delete(accounts).run();
  testDb
    .insert(accounts)
    .values({ id: "acc-1", name: "Checking", type: "Asset" })
    .run();
  testDb
    .insert(transactions)
    .values({
      id: "t-1",
      accountId: "acc-1",
      amount: 100,
      date: "2025-01-01",
      description: "Initial",
    })
    .run();
});

describe("PUT /api/transactions/[id]", () => {
  it("updates an existing transaction", async () => {
    const request = new Request("http://localhost/api/transactions/t-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountId: "acc-1",
        amount: 250,
        date: "2025-01-01",
        description: "Updated",
      }),
    });

    const response = await PUT(request, makeParams("t-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.amount).toBe(250);
    expect(body.description).toBe("Updated");
  });

  it("returns 404 for non-existent transaction", async () => {
    const request = new Request("http://localhost/api/transactions/missing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountId: "acc-1",
        amount: 100,
        date: "2025-01-01",
        description: "Ghost",
      }),
    });

    const response = await PUT(request, makeParams("missing"));

    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/transactions/[id]", () => {
  it("deletes an existing transaction", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/transactions/t-1", {
        method: "DELETE",
      }),
      makeParams("t-1"),
    );

    expect(response.status).toBe(204);

    const rows = testDb.select().from(transactions).all();
    expect(rows).toHaveLength(0);
  });

  it("returns 404 for non-existent transaction", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/transactions/missing", {
        method: "DELETE",
      }),
      makeParams("missing"),
    );

    expect(response.status).toBe(404);
  });
});

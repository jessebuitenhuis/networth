import { beforeEach, describe, expect, it, vi } from "vitest";

import { accounts, transactions } from "@/db/schema";
import { createTestDb } from "@/test/createTestDb";

const testDb = createTestDb();

vi.mock("@/db/connection", () => ({ db: testDb }));

const { GET, POST, DELETE } = await import("./route");

beforeEach(() => {
  testDb.delete(transactions).run();
  testDb.delete(accounts).run();
  testDb
    .insert(accounts)
    .values({ id: "acc-1", name: "Checking", type: "Asset" })
    .run();
});

describe("GET /api/transactions", () => {
  it("returns empty array when no transactions exist", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });

  it("returns all transactions", async () => {
    testDb
      .insert(transactions)
      .values([
        {
          id: "t-1",
          accountId: "acc-1",
          amount: 100,
          date: "2025-01-01",
          description: "Deposit",
        },
        {
          id: "t-2",
          accountId: "acc-1",
          amount: -50,
          date: "2025-01-15",
          description: "Withdrawal",
        },
      ])
      .run();

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(2);
  });

  it("returns transactions with optional fields", async () => {
    testDb
      .insert(transactions)
      .values({
        id: "t-1",
        accountId: "acc-1",
        amount: 200,
        date: "2025-06-01",
        description: "Projected",
        isProjected: true,
        scenarioId: "scenario-1",
      })
      .run();

    const response = await GET();
    const body = await response.json();

    expect(body[0].isProjected).toBe(true);
    expect(body[0].scenarioId).toBe("scenario-1");
  });
});

describe("POST /api/transactions", () => {
  it("creates a single transaction", async () => {
    const request = new Request("http://localhost/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "t-new",
        accountId: "acc-1",
        amount: 500,
        date: "2025-03-01",
        description: "Paycheck",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual(
      expect.objectContaining({ id: "t-new", amount: 500 }),
    );
  });

  it("creates a batch of transactions", async () => {
    const request = new Request("http://localhost/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([
        {
          id: "t-b1",
          accountId: "acc-1",
          amount: 100,
          date: "2025-01-01",
          description: "Batch 1",
        },
        {
          id: "t-b2",
          accountId: "acc-1",
          amount: 200,
          date: "2025-01-02",
          description: "Batch 2",
        },
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
    testDb
      .insert(transactions)
      .values([
        {
          id: "t-1",
          accountId: "acc-1",
          amount: 100,
          date: "2025-01-01",
          description: "A",
        },
        {
          id: "t-2",
          accountId: "acc-1",
          amount: 200,
          date: "2025-01-02",
          description: "B",
        },
      ])
      .run();

    const url = "http://localhost/api/transactions?accountId=acc-1";
    const request = new Request(url, { method: "DELETE" });

    const response = await DELETE(request);

    expect(response.status).toBe(204);

    const rows = testDb.select().from(transactions).all();
    expect(rows).toHaveLength(0);
  });

  it("deletes transactions by scenarioId", async () => {
    testDb
      .insert(transactions)
      .values([
        {
          id: "t-1",
          accountId: "acc-1",
          amount: 100,
          date: "2025-01-01",
          description: "Base",
        },
        {
          id: "t-2",
          accountId: "acc-1",
          amount: 200,
          date: "2025-01-02",
          description: "Scenario",
          scenarioId: "s-1",
        },
      ])
      .run();

    const url = "http://localhost/api/transactions?scenarioId=s-1";
    const request = new Request(url, { method: "DELETE" });

    const response = await DELETE(request);

    expect(response.status).toBe(204);

    const rows = testDb.select().from(transactions).all();
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe("t-1");
  });

  it("returns 400 when no filter provided", async () => {
    const request = new Request("http://localhost/api/transactions", {
      method: "DELETE",
    });

    const response = await DELETE(request);

    expect(response.status).toBe(400);
  });
});

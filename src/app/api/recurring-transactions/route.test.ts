import { beforeEach, describe, expect, it, vi } from "vitest";

import { recurringTransactions } from "@/db/schema";
import { createTestDb } from "@/test/createTestDb";

const testDb = createTestDb();

vi.mock("@/db/connection", () => ({ db: testDb }));

const { GET, POST, DELETE } = await import("./route");

beforeEach(() => {
  testDb.delete(recurringTransactions).run();
});

describe("GET /api/recurring-transactions", () => {
  it("returns empty array when none exist", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });

  it("returns all recurring transactions", async () => {
    testDb
      .insert(recurringTransactions)
      .values([
        {
          id: "rt-1",
          accountId: "acc-1",
          amount: 3000,
          description: "Salary",
          frequency: "Monthly",
          startDate: "2025-01-01",
        },
        {
          id: "rt-2",
          accountId: "acc-1",
          amount: -1200,
          description: "Rent",
          frequency: "Monthly",
          startDate: "2025-01-01",
        },
      ])
      .run();

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(2);
  });

  it("returns recurring transactions with optional fields", async () => {
    testDb
      .insert(recurringTransactions)
      .values({
        id: "rt-1",
        accountId: "acc-1",
        amount: 500,
        description: "Bonus",
        frequency: "Yearly",
        startDate: "2025-01-01",
        endDate: "2027-01-01",
        scenarioId: "s-1",
      })
      .run();

    const response = await GET();
    const body = await response.json();

    expect(body[0].endDate).toBe("2027-01-01");
    expect(body[0].scenarioId).toBe("s-1");
  });
});

describe("POST /api/recurring-transactions", () => {
  it("creates a recurring transaction", async () => {
    const request = new Request(
      "http://localhost/api/recurring-transactions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "rt-new",
          accountId: "acc-1",
          amount: 2000,
          description: "Paycheck",
          frequency: "Monthly",
          startDate: "2025-02-01",
        }),
      },
    );

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual(
      expect.objectContaining({ id: "rt-new", amount: 2000 }),
    );
  });

  it("returns 400 for missing required fields", async () => {
    const request = new Request(
      "http://localhost/api/recurring-transactions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 100 }),
      },
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});

describe("DELETE /api/recurring-transactions (bulk)", () => {
  it("deletes recurring transactions by scenarioId", async () => {
    testDb
      .insert(recurringTransactions)
      .values([
        {
          id: "rt-1",
          accountId: "acc-1",
          amount: 100,
          description: "Base",
          frequency: "Monthly",
          startDate: "2025-01-01",
        },
        {
          id: "rt-2",
          accountId: "acc-1",
          amount: 200,
          description: "Scenario",
          frequency: "Monthly",
          startDate: "2025-01-01",
          scenarioId: "s-1",
        },
      ])
      .run();

    const url =
      "http://localhost/api/recurring-transactions?scenarioId=s-1";
    const request = new Request(url, { method: "DELETE" });

    const response = await DELETE(request);

    expect(response.status).toBe(204);

    const rows = testDb.select().from(recurringTransactions).all();
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe("rt-1");
  });

  it("returns 400 when no filter provided", async () => {
    const request = new Request(
      "http://localhost/api/recurring-transactions",
      { method: "DELETE" },
    );

    const response = await DELETE(request);

    expect(response.status).toBe(400);
  });
});

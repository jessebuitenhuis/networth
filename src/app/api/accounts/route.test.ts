import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { accounts } from "@/db/schema";
import { createTestDb } from "@/test/createTestDb";

const testDb = createTestDb();

vi.mock("@/db/connection", () => ({ db: testDb }));

const { GET, POST } = await import("./route");

beforeEach(() => {
  testDb.delete(accounts).run();
});

describe("GET /api/accounts", () => {
  it("returns empty array when no accounts exist", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });

  it("returns all accounts", async () => {
    testDb
      .insert(accounts)
      .values([
        { id: "1", name: "Checking", type: "Asset" },
        { id: "2", name: "Mortgage", type: "Liability" },
      ])
      .run();

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "1", name: "Checking", type: "Asset" }),
        expect.objectContaining({
          id: "2",
          name: "Mortgage",
          type: "Liability",
        }),
      ]),
    );
  });

  it("returns accounts with expectedReturnRate", async () => {
    testDb
      .insert(accounts)
      .values({ id: "1", name: "Stocks", type: "Asset", expectedReturnRate: 0.07 })
      .run();

    const response = await GET();
    const body = await response.json();

    expect(body[0].expectedReturnRate).toBe(0.07);
  });
});

describe("POST /api/accounts", () => {
  it("creates an account and returns it", async () => {
    const request = new Request("http://localhost/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "new-1",
        name: "Savings",
        type: "Asset",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual(
      expect.objectContaining({ id: "new-1", name: "Savings", type: "Asset" }),
    );

    const rows = testDb.select().from(accounts).where(eq(accounts.id, "new-1")).all();
    expect(rows).toHaveLength(1);
  });

  it("creates an account with expectedReturnRate", async () => {
    const request = new Request("http://localhost/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "new-2",
        name: "Index Fund",
        type: "Asset",
        expectedReturnRate: 0.1,
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.expectedReturnRate).toBe(0.1);
  });

  it("returns 400 for missing required fields", async () => {
    const request = new Request("http://localhost/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Incomplete" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});

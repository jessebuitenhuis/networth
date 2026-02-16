import { beforeEach, describe, expect, it, vi } from "vitest";

import { accounts } from "@/db/schema";
import { createTestDb } from "@/test/createTestDb";

const testDb = createTestDb();

vi.mock("@/db/connection", () => ({ db: testDb }));

const { PUT, DELETE } = await import("./route");

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  testDb.delete(accounts).run();
  testDb
    .insert(accounts)
    .values({ id: "acc-1", name: "Checking", type: "Asset" })
    .run();
});

describe("PUT /api/accounts/[id]", () => {
  it("updates an existing account", async () => {
    const request = new Request("http://localhost/api/accounts/acc-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated Checking", type: "Asset" }),
    });

    const response = await PUT(request, makeParams("acc-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.name).toBe("Updated Checking");
  });

  it("updates expectedReturnRate", async () => {
    const request = new Request("http://localhost/api/accounts/acc-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Checking",
        type: "Asset",
        expectedReturnRate: 0.05,
      }),
    });

    const response = await PUT(request, makeParams("acc-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.expectedReturnRate).toBe(0.05);
  });

  it("returns 404 for non-existent account", async () => {
    const request = new Request("http://localhost/api/accounts/non-existent", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Ghost", type: "Asset" }),
    });

    const response = await PUT(request, makeParams("non-existent"));

    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/accounts/[id]", () => {
  it("deletes an existing account", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/accounts/acc-1", { method: "DELETE" }),
      makeParams("acc-1"),
    );

    expect(response.status).toBe(204);

    const rows = testDb.select().from(accounts).all();
    expect(rows).toHaveLength(0);
  });

  it("returns 404 for non-existent account", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/accounts/non-existent", {
        method: "DELETE",
      }),
      makeParams("non-existent"),
    );

    expect(response.status).toBe(404);
  });
});

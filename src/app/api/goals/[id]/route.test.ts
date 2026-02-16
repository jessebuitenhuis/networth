import { beforeEach, describe, expect, it, vi } from "vitest";

import { goals } from "@/db/schema";
import { createTestDb } from "@/test/createTestDb";

const testDb = createTestDb();

vi.mock("@/db/connection", () => ({ db: testDb }));

const { PUT, DELETE } = await import("./route");

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  testDb.delete(goals).run();
  testDb
    .insert(goals)
    .values({ id: "g-1", name: "Emergency Fund", targetAmount: 10000 })
    .run();
});

describe("PUT /api/goals/[id]", () => {
  it("updates an existing goal", async () => {
    const request = new Request("http://localhost/api/goals/g-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated Fund", targetAmount: 15000 }),
    });

    const response = await PUT(request, makeParams("g-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.name).toBe("Updated Fund");
    expect(body.targetAmount).toBe(15000);
  });

  it("returns 404 for non-existent goal", async () => {
    const request = new Request("http://localhost/api/goals/missing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Ghost", targetAmount: 999 }),
    });

    const response = await PUT(request, makeParams("missing"));

    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/goals/[id]", () => {
  it("deletes an existing goal", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/goals/g-1", { method: "DELETE" }),
      makeParams("g-1"),
    );

    expect(response.status).toBe(204);

    const rows = testDb.select().from(goals).all();
    expect(rows).toHaveLength(0);
  });

  it("returns 404 for non-existent goal", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/goals/missing", { method: "DELETE" }),
      makeParams("missing"),
    );

    expect(response.status).toBe(404);
  });
});

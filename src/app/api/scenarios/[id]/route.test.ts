import { beforeEach, describe, expect, it, vi } from "vitest";

import { scenarios } from "@/db/schema";
import { createTestDb } from "@/test/createTestDb";

const testDb = createTestDb();

vi.mock("@/db/connection", () => ({ db: testDb }));

const { PUT, DELETE } = await import("./route");

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  testDb.delete(scenarios).run();
  testDb
    .insert(scenarios)
    .values({ id: "s-1", name: "Base Plan" })
    .run();
});

describe("PUT /api/scenarios/[id]", () => {
  it("updates an existing scenario", async () => {
    const request = new Request("http://localhost/api/scenarios/s-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated Plan" }),
    });

    const response = await PUT(request, makeParams("s-1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.name).toBe("Updated Plan");
  });

  it("returns 404 for non-existent scenario", async () => {
    const request = new Request("http://localhost/api/scenarios/missing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Ghost" }),
    });

    const response = await PUT(request, makeParams("missing"));

    expect(response.status).toBe(404);
  });
});

describe("DELETE /api/scenarios/[id]", () => {
  it("deletes an existing scenario", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/scenarios/s-1", { method: "DELETE" }),
      makeParams("s-1"),
    );

    expect(response.status).toBe(204);

    const rows = testDb.select().from(scenarios).all();
    expect(rows).toHaveLength(0);
  });

  it("returns 404 for non-existent scenario", async () => {
    const response = await DELETE(
      new Request("http://localhost/api/scenarios/missing", {
        method: "DELETE",
      }),
      makeParams("missing"),
    );

    expect(response.status).toBe(404);
  });
});

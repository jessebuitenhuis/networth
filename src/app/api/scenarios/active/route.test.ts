import { beforeEach, describe, expect, it, vi } from "vitest";

import { settings } from "@/db/schema";
import { createTestDb } from "@/test/createTestDb";

const testDb = createTestDb();

vi.mock("@/db/connection", () => ({ db: testDb }));

const { PUT } = await import("./route");

beforeEach(() => {
  testDb.delete(settings).run();
});

describe("PUT /api/scenarios/active", () => {
  it("sets the active scenario id", async () => {
    const request = new Request("http://localhost/api/scenarios/active", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenarioId: "s-1" }),
    });

    const response = await PUT(request);

    expect(response.status).toBe(200);

    const row = testDb
      .select()
      .from(settings)
      .all()
      .find((r) => r.key === "activeScenarioId");
    expect(row?.value).toBe("s-1");
  });

  it("updates existing active scenario id", async () => {
    testDb
      .insert(settings)
      .values({ key: "activeScenarioId", value: "s-1" })
      .run();

    const request = new Request("http://localhost/api/scenarios/active", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenarioId: "s-2" }),
    });

    const response = await PUT(request);

    expect(response.status).toBe(200);

    const row = testDb
      .select()
      .from(settings)
      .all()
      .find((r) => r.key === "activeScenarioId");
    expect(row?.value).toBe("s-2");
  });

  it("returns 400 when scenarioId is missing", async () => {
    const request = new Request("http://localhost/api/scenarios/active", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await PUT(request);

    expect(response.status).toBe(400);
  });
});

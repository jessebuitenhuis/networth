import { beforeEach, describe, expect, it, vi } from "vitest";

import { scenarios, settings } from "@/db/schema";
import { createTestDb } from "@/test/createTestDb";

const testDb = createTestDb();

vi.mock("@/db/connection", () => ({ db: testDb }));

const { GET, POST } = await import("./route");

beforeEach(() => {
  testDb.delete(settings).run();
  testDb.delete(scenarios).run();
});

describe("GET /api/scenarios", () => {
  it("auto-creates Base Plan when no scenarios exist", async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.scenarios).toHaveLength(1);
    expect(body.scenarios[0].name).toBe("Base Plan");
    expect(body.activeScenarioId).toBe(body.scenarios[0].id);
  });

  it("returns existing scenarios with active id", async () => {
    testDb
      .insert(scenarios)
      .values([
        { id: "s-1", name: "Base Plan" },
        { id: "s-2", name: "Optimistic" },
      ])
      .run();
    testDb
      .insert(settings)
      .values({ key: "activeScenarioId", value: "s-1" })
      .run();

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.scenarios).toHaveLength(2);
    expect(body.activeScenarioId).toBe("s-1");
  });
});

describe("POST /api/scenarios", () => {
  it("creates a scenario", async () => {
    const request = new Request("http://localhost/api/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "s-new", name: "Pessimistic" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual(
      expect.objectContaining({ id: "s-new", name: "Pessimistic" }),
    );
  });

  it("returns 400 for missing required fields", async () => {
    const request = new Request("http://localhost/api/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });
});

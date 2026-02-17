import { beforeEach, describe, expect, it, vi } from "vitest";

import { scenarios, settings } from "@/db/schema";
import { createTestDb } from "@/test/createTestDb";

const testDb = createTestDb();
vi.mock("@/db/connection", () => ({ db: testDb }));
vi.mock("@/lib/generateId", () => ({ generateId: () => "generated-id" }));

const {
  getAllScenarios,
  getScenarioById,
  createScenario,
  updateScenario,
  deleteScenario,
  getActiveScenarioId,
  setActiveScenarioId,
  ensureBasePlanExists,
} = await import("./scenarioRepository");

beforeEach(() => {
  testDb.delete(settings).run();
  testDb.delete(scenarios).run();
});

describe("getAllScenarios", () => {
  it("returns empty array when none exist", () => {
    expect(getAllScenarios()).toEqual([]);
  });

  it("returns all scenarios when populated", () => {
    testDb
      .insert(scenarios)
      .values([
        { id: "s-1", name: "Base Plan" },
        { id: "s-2", name: "Optimistic" },
      ])
      .run();

    expect(getAllScenarios()).toHaveLength(2);
  });
});

describe("getScenarioById", () => {
  it("returns the matching scenario", () => {
    testDb.insert(scenarios).values({ id: "s-1", name: "Base Plan" }).run();

    const result = getScenarioById("s-1");
    expect(result).toEqual(expect.objectContaining({ id: "s-1", name: "Base Plan" }));
  });

  it("returns undefined for non-existent id", () => {
    expect(getScenarioById("non-existent")).toBeUndefined();
  });
});

describe("createScenario", () => {
  it("inserts and returns the created scenario", () => {
    const result = createScenario({ id: "s-1", name: "Pessimistic" });
    expect(result).toEqual(expect.objectContaining({ id: "s-1", name: "Pessimistic" }));
  });
});

describe("updateScenario", () => {
  it("modifies and returns the updated scenario", () => {
    testDb.insert(scenarios).values({ id: "s-1", name: "Base Plan" }).run();

    const result = updateScenario("s-1", { name: "Updated Plan" });
    expect(result.name).toBe("Updated Plan");
  });
});

describe("deleteScenario", () => {
  it("removes the scenario", () => {
    testDb.insert(scenarios).values({ id: "s-1", name: "Base Plan" }).run();

    deleteScenario("s-1");
    expect(getAllScenarios()).toHaveLength(0);
  });
});

describe("getActiveScenarioId", () => {
  it("returns null when not set", () => {
    expect(getActiveScenarioId()).toBeNull();
  });

  it("returns the active scenario id when set", () => {
    testDb.insert(settings).values({ key: "activeScenarioId", value: "s-1" }).run();

    expect(getActiveScenarioId()).toBe("s-1");
  });
});

describe("setActiveScenarioId", () => {
  it("inserts the active scenario id", () => {
    setActiveScenarioId("s-1");
    expect(getActiveScenarioId()).toBe("s-1");
  });

  it("upserts when active scenario id already exists", () => {
    setActiveScenarioId("s-1");
    setActiveScenarioId("s-2");
    expect(getActiveScenarioId()).toBe("s-2");
  });
});

describe("ensureBasePlanExists", () => {
  it("creates Base Plan when no scenarios exist", () => {
    ensureBasePlanExists();

    const rows = getAllScenarios();
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Base Plan");
    expect(rows[0].id).toBe("generated-id");
  });

  it("sets the active scenario id when creating Base Plan", () => {
    ensureBasePlanExists();
    expect(getActiveScenarioId()).toBe("generated-id");
  });

  it("does nothing when scenarios already exist", () => {
    testDb.insert(scenarios).values({ id: "s-1", name: "Existing Plan" }).run();

    ensureBasePlanExists();

    expect(getAllScenarios()).toHaveLength(1);
    expect(getAllScenarios()[0].name).toBe("Existing Plan");
  });
});

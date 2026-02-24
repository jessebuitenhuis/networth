import { beforeEach, describe, expect, it, vi } from "vitest";

import { scenarios, settings } from "@/db/schema";
import { createTestDb } from "@/test/createTestDb";

vi.mock("@/lib/getCurrentUserId", () => ({ getCurrentUserId: () => "test-user" }));

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
        { id: "s-1", name: "Base Plan", userId: "test-user" },
        { id: "s-2", name: "Optimistic", userId: "test-user" },
      ])
      .run();

    expect(getAllScenarios()).toHaveLength(2);
  });
});

describe("getScenarioById", () => {
  it("returns the matching scenario", () => {
    testDb.insert(scenarios).values({ id: "s-1", name: "Base Plan", userId: "test-user" }).run();

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

  it("inserts and returns a scenario with inflation rate", () => {
    const result = createScenario({ id: "s-1", name: "Inflation", inflationRate: 3.5 });
    expect(result).toEqual(expect.objectContaining({ id: "s-1", name: "Inflation", inflationRate: 3.5 }));
  });
});

describe("updateScenario", () => {
  it("modifies and returns the updated scenario", () => {
    testDb.insert(scenarios).values({ id: "s-1", name: "Base Plan", userId: "test-user" }).run();

    const result = updateScenario("s-1", { name: "Updated Plan" });
    expect(result.name).toBe("Updated Plan");
  });

  it("updates inflation rate", () => {
    testDb.insert(scenarios).values({ id: "s-1", name: "Base Plan", userId: "test-user" }).run();

    const result = updateScenario("s-1", { name: "Base Plan", inflationRate: 2.5 });
    expect(result.inflationRate).toBe(2.5);
  });

  it("clears inflation rate when undefined", () => {
    testDb.insert(scenarios).values({ id: "s-1", name: "Base Plan", inflationRate: 3, userId: "test-user" }).run();

    const result = updateScenario("s-1", { name: "Base Plan" });
    expect(result.inflationRate).toBeNull();
  });
});

describe("deleteScenario", () => {
  it("removes the scenario", () => {
    testDb.insert(scenarios).values({ id: "s-1", name: "Base Plan", userId: "test-user" }).run();

    deleteScenario("s-1");
    expect(getAllScenarios()).toHaveLength(0);
  });
});

describe("getActiveScenarioId", () => {
  it("returns null when not set", () => {
    expect(getActiveScenarioId()).toBeNull();
  });

  it("returns the active scenario id when set", () => {
    testDb.insert(settings).values({ userId: "test-user", key: "activeScenarioId", value: "s-1" }).run();

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
    testDb.insert(scenarios).values({ id: "s-1", name: "Existing Plan", userId: "test-user" }).run();

    ensureBasePlanExists();

    expect(getAllScenarios()).toHaveLength(1);
    expect(getAllScenarios()[0].name).toBe("Existing Plan");
  });
});

describe("cross-user isolation", () => {
  it("getAllScenarios does not return other user's scenarios", () => {
    testDb
      .insert(scenarios)
      .values([
        { id: "s-1", name: "Mine", userId: "test-user" },
        { id: "s-2", name: "Theirs", userId: "other-user" },
      ])
      .run();

    const result = getAllScenarios();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("s-1");
  });

  it("getScenarioById returns undefined for other user's scenario", () => {
    testDb.insert(scenarios).values({ id: "s-1", name: "Other", userId: "other-user" }).run();

    expect(getScenarioById("s-1")).toBeUndefined();
  });

  it("updateScenario does not modify other user's scenario", () => {
    testDb.insert(scenarios).values({ id: "s-1", name: "Original", userId: "other-user" }).run();

    updateScenario("s-1", { name: "Hacked" });

    const allRows = testDb.select().from(scenarios).all();
    expect(allRows.find((r) => r.id === "s-1")?.name).toBe("Original");
  });

  it("deleteScenario does not delete other user's scenario", () => {
    testDb.insert(scenarios).values({ id: "s-1", name: "Other", userId: "other-user" }).run();

    deleteScenario("s-1");

    const allRows = testDb.select().from(scenarios).all();
    expect(allRows.find((r) => r.id === "s-1")).toBeDefined();
  });

  it("getActiveScenarioId does not return other user's active scenario", () => {
    testDb.insert(settings).values({ userId: "other-user", key: "activeScenarioId", value: "s-99" }).run();

    expect(getActiveScenarioId()).toBeNull();
  });

  it("setActiveScenarioId does not overwrite other user's setting", () => {
    testDb.insert(settings).values({ userId: "other-user", key: "activeScenarioId", value: "s-99" }).run();

    setActiveScenarioId("s-1");

    const allSettings = testDb.select().from(settings).all();
    expect(allSettings.find((s) => s.userId === "other-user")?.value).toBe("s-99");
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

import { scenarios, settings } from "@/db/schema";
import { createTestDb } from "@/test/createTestDb";

const TEST_USER_ID = "test-user";

const testDb = createTestDb();
vi.mock("@/db/connection", () => ({ db: testDb }));
vi.mock("@/lib/generateId", () => ({ generateId: () => "generated-id" }));
vi.mock("@/auth/getCurrentUserId", () => ({ getCurrentUserId: vi.fn() }));

const { getCurrentUserId } = await import("@/auth/getCurrentUserId");
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
  vi.mocked(getCurrentUserId).mockResolvedValue(TEST_USER_ID);
});

describe("getAllScenarios", () => {
  it("returns empty array when none exist", async () => {
    expect(await getAllScenarios()).toEqual([]);
  });

  it("returns all scenarios when populated", async () => {
    testDb
      .insert(scenarios)
      .values([
        { id: "s-1", name: "Base Plan", userId: TEST_USER_ID },
        { id: "s-2", name: "Optimistic", userId: TEST_USER_ID },
      ])
      .run();

    expect(await getAllScenarios()).toHaveLength(2);
  });
});

describe("getScenarioById", () => {
  it("returns the matching scenario", async () => {
    testDb.insert(scenarios).values({ id: "s-1", name: "Base Plan", userId: TEST_USER_ID }).run();

    const result = await getScenarioById("s-1");
    expect(result).toEqual(expect.objectContaining({ id: "s-1", name: "Base Plan" }));
  });

  it("returns undefined for non-existent id", async () => {
    expect(await getScenarioById("non-existent")).toBeUndefined();
  });
});

describe("createScenario", () => {
  it("inserts and returns the created scenario", async () => {
    const result = await createScenario({ id: "s-1", name: "Pessimistic" });
    expect(result).toEqual(expect.objectContaining({ id: "s-1", name: "Pessimistic" }));
  });

  it("inserts and returns a scenario with inflation rate", async () => {
    const result = await createScenario({ id: "s-1", name: "Inflation", inflationRate: 3.5 });
    expect(result).toEqual(expect.objectContaining({ id: "s-1", name: "Inflation", inflationRate: 3.5 }));
  });
});

describe("updateScenario", () => {
  it("modifies and returns the updated scenario", async () => {
    testDb.insert(scenarios).values({ id: "s-1", name: "Base Plan", userId: TEST_USER_ID }).run();

    const result = await updateScenario("s-1", { name: "Updated Plan" });
    expect(result.name).toBe("Updated Plan");
  });

  it("updates inflation rate", async () => {
    testDb.insert(scenarios).values({ id: "s-1", name: "Base Plan", userId: TEST_USER_ID }).run();

    const result = await updateScenario("s-1", { name: "Base Plan", inflationRate: 2.5 });
    expect(result.inflationRate).toBe(2.5);
  });

  it("clears inflation rate when undefined", async () => {
    testDb.insert(scenarios).values({ id: "s-1", name: "Base Plan", inflationRate: 3, userId: TEST_USER_ID }).run();

    const result = await updateScenario("s-1", { name: "Base Plan" });
    expect(result.inflationRate).toBeNull();
  });
});

describe("deleteScenario", () => {
  it("removes the scenario", async () => {
    testDb.insert(scenarios).values({ id: "s-1", name: "Base Plan", userId: TEST_USER_ID }).run();

    await deleteScenario("s-1");
    expect(await getAllScenarios()).toHaveLength(0);
  });
});

describe("getActiveScenarioId", () => {
  it("returns null when not set", async () => {
    expect(await getActiveScenarioId()).toBeNull();
  });

  it("returns the active scenario id when set", async () => {
    testDb.insert(settings).values({ userId: TEST_USER_ID, key: "activeScenarioId", value: "s-1" }).run();

    expect(await getActiveScenarioId()).toBe("s-1");
  });
});

describe("setActiveScenarioId", () => {
  it("inserts the active scenario id", async () => {
    await setActiveScenarioId("s-1");
    expect(await getActiveScenarioId()).toBe("s-1");
  });

  it("upserts when active scenario id already exists", async () => {
    await setActiveScenarioId("s-1");
    await setActiveScenarioId("s-2");
    expect(await getActiveScenarioId()).toBe("s-2");
  });
});

describe("ensureBasePlanExists", () => {
  it("creates Base Plan when no scenarios exist", async () => {
    await ensureBasePlanExists();

    const rows = await getAllScenarios();
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Base Plan");
    expect(rows[0].id).toBe("generated-id");
  });

  it("sets the active scenario id when creating Base Plan", async () => {
    await ensureBasePlanExists();
    expect(await getActiveScenarioId()).toBe("generated-id");
  });

  it("does nothing when scenarios already exist", async () => {
    testDb.insert(scenarios).values({ id: "s-1", name: "Existing Plan", userId: TEST_USER_ID }).run();

    await ensureBasePlanExists();

    const rows = await getAllScenarios();
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Existing Plan");
  });
});

describe("cross-user isolation", () => {
  it("getAllScenarios does not return other user's scenarios", async () => {
    testDb
      .insert(scenarios)
      .values([
        { id: "s-1", name: "Mine", userId: TEST_USER_ID },
        { id: "s-2", name: "Theirs", userId: "other-user" },
      ])
      .run();

    const result = await getAllScenarios();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("s-1");
  });

  it("getScenarioById returns undefined for other user's scenario", async () => {
    testDb.insert(scenarios).values({ id: "s-1", name: "Other", userId: "other-user" }).run();

    expect(await getScenarioById("s-1")).toBeUndefined();
  });

  it("updateScenario does not modify other user's scenario", async () => {
    testDb.insert(scenarios).values({ id: "s-1", name: "Original", userId: "other-user" }).run();

    await updateScenario("s-1", { name: "Hacked" });

    const allRows = testDb.select().from(scenarios).all();
    expect(allRows.find((r) => r.id === "s-1")?.name).toBe("Original");
  });

  it("deleteScenario does not delete other user's scenario", async () => {
    testDb.insert(scenarios).values({ id: "s-1", name: "Other", userId: "other-user" }).run();

    await deleteScenario("s-1");

    const allRows = testDb.select().from(scenarios).all();
    expect(allRows.find((r) => r.id === "s-1")).toBeDefined();
  });

  it("getActiveScenarioId does not return other user's active scenario", async () => {
    testDb.insert(settings).values({ userId: "other-user", key: "activeScenarioId", value: "s-99" }).run();

    expect(await getActiveScenarioId()).toBeNull();
  });

  it("setActiveScenarioId does not overwrite other user's setting", async () => {
    testDb.insert(settings).values({ userId: "other-user", key: "activeScenarioId", value: "s-99" }).run();

    await setActiveScenarioId("s-1");

    const allSettings = testDb.select().from(settings).all();
    expect(allSettings.find((s) => s.userId === "other-user")?.value).toBe("s-99");
  });
});

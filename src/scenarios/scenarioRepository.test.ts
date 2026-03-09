import { beforeEach, describe, expect, it, vi } from "vitest";

import { scenarios, settings } from "@/db/schema";
import { createTestDb } from "@/test/createTestDb";

const testDb = await createTestDb();
vi.mock("@/lib/generateId", () => ({ generateId: () => "generated-id" }));

const {
  scenarioRepo,
  getActiveScenarioId,
  setActiveScenarioId,
  ensureBasePlanExists,
} = await import("./scenarioRepository");

beforeEach(async () => {
  await testDb.delete(settings);
  await testDb.delete(scenarios);
});

describe("getAllScenarios", () => {
  it("returns empty array when none exist", async () => {
    expect(await scenarioRepo.getAll()).toEqual([]);
  });

  it("returns all scenarios when populated", async () => {
    await testDb
      .insert(scenarios)
      .values([
        { id: "s-1", name: "Base Plan"},
        { id: "s-2", name: "Optimistic"},
      ]);

    expect(await scenarioRepo.getAll()).toHaveLength(2);
  });
});

describe("getScenarioById", () => {
  it("returns the matching scenario", async () => {
    await testDb.insert(scenarios).values({ id: "s-1", name: "Base Plan"});

    const result = await scenarioRepo.getById("s-1");
    expect(result).toEqual(expect.objectContaining({ id: "s-1", name: "Base Plan" }));
  });

  it("returns undefined for non-existent id", async () => {
    expect(await scenarioRepo.getById("non-existent")).toBeUndefined();
  });
});

describe("createScenario", () => {
  it("inserts and returns the created scenario", async () => {
    const result = await scenarioRepo.createScenario({ id: "s-1", name: "Pessimistic" });
    expect(result).toEqual(expect.objectContaining({ id: "s-1", name: "Pessimistic" }));
  });

  it("inserts and returns a scenario with inflation rate", async () => {
    const result = await scenarioRepo.createScenario({ id: "s-1", name: "Inflation", inflationRate: 3.5 });
    expect(result).toEqual(expect.objectContaining({ id: "s-1", name: "Inflation", inflationRate: 3.5 }));
  });
});

describe("updateScenario", () => {
  it("modifies and returns the updated scenario", async () => {
    await testDb.insert(scenarios).values({ id: "s-1", name: "Base Plan"});

    const result = await scenarioRepo.updateScenario("s-1", { name: "Updated Plan" });
    expect(result.name).toBe("Updated Plan");
  });

  it("updates inflation rate", async () => {
    await testDb.insert(scenarios).values({ id: "s-1", name: "Base Plan"});

    const result = await scenarioRepo.updateScenario("s-1", { name: "Base Plan", inflationRate: 2.5 });
    expect(result.inflationRate).toBe(2.5);
  });

  it("clears inflation rate when undefined", async () => {
    await testDb.insert(scenarios).values({ id: "s-1", name: "Base Plan", inflationRate: 3});

    const result = await scenarioRepo.updateScenario("s-1", { name: "Base Plan" });
    expect(result.inflationRate).toBeNull();
  });
});

describe("deleteScenario", () => {
  it("removes the scenario", async () => {
    await testDb.insert(scenarios).values({ id: "s-1", name: "Base Plan"});

    await scenarioRepo.delete("s-1");
    expect(await scenarioRepo.getAll()).toHaveLength(0);
  });
});

describe("getActiveScenarioId", () => {
  it("returns null when not set", async () => {
    expect(await getActiveScenarioId()).toBeNull();
  });

  it("returns the active scenario id when set", async () => {
    await testDb.insert(settings).values({ key: "activeScenarioId", value: "s-1" });

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

    const rows = await scenarioRepo.getAll();
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Base Plan");
    expect(rows[0].id).toBe("generated-id");
  });

  it("sets the active scenario id when creating Base Plan", async () => {
    await ensureBasePlanExists();
    expect(await getActiveScenarioId()).toBe("generated-id");
  });

  it("does nothing when scenarios already exist", async () => {
    await testDb.insert(scenarios).values({ id: "s-1", name: "Existing Plan"});

    await ensureBasePlanExists();

    const rows = await scenarioRepo.getAll();
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Existing Plan");
  });
});

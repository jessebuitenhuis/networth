import { beforeEach, describe, expect, it, vi } from "vitest";

import { goals } from "@/db/schema";
import { createTestDb } from "@/test/createTestDb";

const testDb = createTestDb();
vi.mock("@/db/connection", () => ({ db: testDb }));

const { getAllGoals, getGoalById, createGoal, updateGoal, deleteGoal } =
  await import("./goalRepository");

beforeEach(() => {
  testDb.delete(goals).run();
});

describe("getAllGoals", () => {
  it("returns empty array when no goals exist", () => {
    expect(getAllGoals("test-user")).toEqual([]);
  });

  it("returns all goals when populated", () => {
    testDb
      .insert(goals)
      .values([
        { id: "g-1", name: "Emergency Fund", targetAmount: 10000, userId: "test-user" },
        { id: "g-2", name: "House Down Payment", targetAmount: 50000, userId: "test-user" },
      ])
      .run();

    expect(getAllGoals("test-user")).toHaveLength(2);
  });
});

describe("getGoalById", () => {
  it("returns the matching goal", () => {
    testDb.insert(goals).values({ id: "g-1", name: "Emergency Fund", targetAmount: 10000, userId: "test-user" }).run();

    const result = getGoalById("test-user", "g-1");
    expect(result).toEqual(
      expect.objectContaining({ id: "g-1", name: "Emergency Fund", targetAmount: 10000 }),
    );
  });

  it("returns undefined for non-existent id", () => {
    expect(getGoalById("test-user", "non-existent")).toBeUndefined();
  });
});

describe("createGoal", () => {
  it("inserts and returns the created goal", () => {
    const result = createGoal("test-user", { id: "g-1", name: "Retirement", targetAmount: 1000000 });
    expect(result).toEqual(
      expect.objectContaining({ id: "g-1", name: "Retirement", targetAmount: 1000000 }),
    );
  });
});

describe("updateGoal", () => {
  it("modifies and returns the updated goal", () => {
    testDb.insert(goals).values({ id: "g-1", name: "Emergency Fund", targetAmount: 10000, userId: "test-user" }).run();

    const result = updateGoal("test-user", "g-1", { name: "Updated Fund", targetAmount: 15000 });
    expect(result.name).toBe("Updated Fund");
    expect(result.targetAmount).toBe(15000);
  });
});

describe("deleteGoal", () => {
  it("removes the goal", () => {
    testDb.insert(goals).values({ id: "g-1", name: "Emergency Fund", targetAmount: 10000, userId: "test-user" }).run();

    deleteGoal("test-user", "g-1");
    expect(getAllGoals("test-user")).toHaveLength(0);
  });
});

describe("cross-user isolation", () => {
  it("getAllGoals does not return other user's goals", () => {
    testDb
      .insert(goals)
      .values([
        { id: "g-1", name: "My Goal", targetAmount: 10000, userId: "test-user" },
        { id: "g-2", name: "Other Goal", targetAmount: 20000, userId: "other-user" },
      ])
      .run();

    const result = getAllGoals("test-user");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("g-1");
  });

  it("getGoalById returns undefined for other user's goal", () => {
    testDb.insert(goals).values({ id: "g-1", name: "Other", targetAmount: 10000, userId: "other-user" }).run();

    expect(getGoalById("test-user", "g-1")).toBeUndefined();
  });

  it("updateGoal does not modify other user's goal", () => {
    testDb.insert(goals).values({ id: "g-1", name: "Original", targetAmount: 10000, userId: "other-user" }).run();

    updateGoal("test-user", "g-1", { name: "Hacked", targetAmount: 0 });

    const allRows = testDb.select().from(goals).all();
    expect(allRows.find((r) => r.id === "g-1")?.name).toBe("Original");
  });

  it("deleteGoal does not delete other user's goal", () => {
    testDb.insert(goals).values({ id: "g-1", name: "Other", targetAmount: 10000, userId: "other-user" }).run();

    deleteGoal("test-user", "g-1");

    const allRows = testDb.select().from(goals).all();
    expect(allRows.find((r) => r.id === "g-1")).toBeDefined();
  });
});

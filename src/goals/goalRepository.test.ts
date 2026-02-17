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
    expect(getAllGoals()).toEqual([]);
  });

  it("returns all goals when populated", () => {
    testDb
      .insert(goals)
      .values([
        { id: "g-1", name: "Emergency Fund", targetAmount: 10000 },
        { id: "g-2", name: "House Down Payment", targetAmount: 50000 },
      ])
      .run();

    expect(getAllGoals()).toHaveLength(2);
  });
});

describe("getGoalById", () => {
  it("returns the matching goal", () => {
    testDb.insert(goals).values({ id: "g-1", name: "Emergency Fund", targetAmount: 10000 }).run();

    const result = getGoalById("g-1");
    expect(result).toEqual(
      expect.objectContaining({ id: "g-1", name: "Emergency Fund", targetAmount: 10000 }),
    );
  });

  it("returns undefined for non-existent id", () => {
    expect(getGoalById("non-existent")).toBeUndefined();
  });
});

describe("createGoal", () => {
  it("inserts and returns the created goal", () => {
    const result = createGoal({ id: "g-1", name: "Retirement", targetAmount: 1000000 });
    expect(result).toEqual(
      expect.objectContaining({ id: "g-1", name: "Retirement", targetAmount: 1000000 }),
    );
  });
});

describe("updateGoal", () => {
  it("modifies and returns the updated goal", () => {
    testDb.insert(goals).values({ id: "g-1", name: "Emergency Fund", targetAmount: 10000 }).run();

    const result = updateGoal("g-1", { name: "Updated Fund", targetAmount: 15000 });
    expect(result.name).toBe("Updated Fund");
    expect(result.targetAmount).toBe(15000);
  });
});

describe("deleteGoal", () => {
  it("removes the goal", () => {
    testDb.insert(goals).values({ id: "g-1", name: "Emergency Fund", targetAmount: 10000 }).run();

    deleteGoal("g-1");
    expect(getAllGoals()).toHaveLength(0);
  });
});

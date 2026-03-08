import { beforeEach, describe, expect, it } from "vitest";

import { goals } from "@/db/schema";
import { createTestDb, TEST_USER_ID } from "@/test/createTestDb";

const testDb = createTestDb();

const { getAllGoals, getGoalById, createGoal, updateGoal, deleteGoal } =
  await import("./goalRepository");

beforeEach(() => {
  testDb.delete(goals).run();
});

describe("getAllGoals", () => {
  it("returns empty array when no goals exist", async () => {
    expect(await getAllGoals()).toEqual([]);
  });

  it("returns all goals when populated", async () => {
    testDb
      .insert(goals)
      .values([
        { id: "g-1", name: "Emergency Fund", targetAmount: 10000, userId: TEST_USER_ID },
        { id: "g-2", name: "House Down Payment", targetAmount: 50000, userId: TEST_USER_ID },
      ])
      .run();

    expect(await getAllGoals()).toHaveLength(2);
  });
});

describe("getGoalById", () => {
  it("returns the matching goal", async () => {
    testDb.insert(goals).values({ id: "g-1", name: "Emergency Fund", targetAmount: 10000, userId: TEST_USER_ID }).run();

    const result = await getGoalById("g-1");
    expect(result).toEqual(
      expect.objectContaining({ id: "g-1", name: "Emergency Fund", targetAmount: 10000 }),
    );
  });

  it("returns undefined for non-existent id", async () => {
    expect(await getGoalById("non-existent")).toBeUndefined();
  });
});

describe("createGoal", () => {
  it("inserts and returns the created goal", async () => {
    const result = await createGoal({ id: "g-1", name: "Retirement", targetAmount: 1000000 });
    expect(result).toEqual(
      expect.objectContaining({ id: "g-1", name: "Retirement", targetAmount: 1000000 }),
    );
  });
});

describe("updateGoal", () => {
  it("modifies and returns the updated goal", async () => {
    testDb.insert(goals).values({ id: "g-1", name: "Emergency Fund", targetAmount: 10000, userId: TEST_USER_ID }).run();

    const result = await updateGoal("g-1", { name: "Updated Fund", targetAmount: 15000 });
    expect(result.name).toBe("Updated Fund");
    expect(result.targetAmount).toBe(15000);
  });
});

describe("deleteGoal", () => {
  it("removes the goal", async () => {
    testDb.insert(goals).values({ id: "g-1", name: "Emergency Fund", targetAmount: 10000, userId: TEST_USER_ID }).run();

    await deleteGoal("g-1");
    expect(await getAllGoals()).toHaveLength(0);
  });
});

import { beforeEach, describe, expect, it } from "vitest";

import { goals } from "@/db/schema";
import { createTestDb } from "@/test/createTestDb";

const testDb = await createTestDb();

const { goalRepo } = await import("./goalRepository");

beforeEach(async () => {
  await testDb.delete(goals);
});

describe("getAllGoals", () => {
  it("returns empty array when no goals exist", async () => {
    expect(await goalRepo.getAll()).toEqual([]);
  });

  it("returns all goals when populated", async () => {
    await testDb
      .insert(goals)
      .values([
        { id: "g-1", name: "Emergency Fund", targetAmount: 10000},
        { id: "g-2", name: "House Down Payment", targetAmount: 50000},
      ]);

    expect(await goalRepo.getAll()).toHaveLength(2);
  });
});

describe("getGoalById", () => {
  it("returns the matching goal", async () => {
    await testDb.insert(goals).values({ id: "g-1", name: "Emergency Fund", targetAmount: 10000});

    const result = await goalRepo.getById("g-1");
    expect(result).toEqual(
      expect.objectContaining({ id: "g-1", name: "Emergency Fund", targetAmount: 10000 }),
    );
  });

  it("returns undefined for non-existent id", async () => {
    expect(await goalRepo.getById("non-existent")).toBeUndefined();
  });
});

describe("createGoal", () => {
  it("inserts and returns the created goal", async () => {
    const result = await goalRepo.createGoal({ id: "g-1", name: "Retirement", targetAmount: 1000000 });
    expect(result).toEqual(
      expect.objectContaining({ id: "g-1", name: "Retirement", targetAmount: 1000000 }),
    );
  });
});

describe("updateGoal", () => {
  it("modifies and returns the updated goal", async () => {
    await testDb.insert(goals).values({ id: "g-1", name: "Emergency Fund", targetAmount: 10000});

    const result = await goalRepo.updateGoal("g-1", { name: "Updated Fund", targetAmount: 15000 });
    expect(result.name).toBe("Updated Fund");
    expect(result.targetAmount).toBe(15000);
  });
});

describe("deleteGoal", () => {
  it("removes the goal", async () => {
    await testDb.insert(goals).values({ id: "g-1", name: "Emergency Fund", targetAmount: 10000});

    await goalRepo.delete("g-1");
    expect(await goalRepo.getAll()).toHaveLength(0);
  });
});

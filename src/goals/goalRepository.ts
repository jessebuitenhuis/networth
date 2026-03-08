import { eq } from "drizzle-orm";

import { goals } from "@/db/schema";
import { getUserDb } from "@/db/userDb";

export function getAllGoals(userId: string) {
  return getUserDb(userId).select(goals).all();
}

export function getGoalById(userId: string, id: string) {
  const [row] = getUserDb(userId).select(goals, eq(goals.id, id)).all();
  return row;
}

export function createGoal(
  userId: string,
  {
    id,
    name,
    targetAmount,
  }: {
    id: string;
    name: string;
    targetAmount: number;
  },
) {
  getUserDb(userId).insert(goals, { id, name, targetAmount }).run();
  return getGoalById(userId, id)!;
}

export function updateGoal(
  userId: string,
  id: string,
  { name, targetAmount }: { name: string; targetAmount: number },
) {
  getUserDb(userId).update(goals, { name, targetAmount }, eq(goals.id, id)).run();
  return getGoalById(userId, id)!;
}

export function deleteGoal(userId: string, id: string) {
  getUserDb(userId).delete(goals, eq(goals.id, id)).run();
}

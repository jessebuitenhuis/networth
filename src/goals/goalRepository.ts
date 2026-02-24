import { eq } from "drizzle-orm";

import { goals } from "@/db/schema";
import { getUserDb } from "@/db/userDb";

export function getAllGoals() {
  return getUserDb().select(goals).all();
}

export function getGoalById(id: string) {
  const [row] = getUserDb().select(goals, eq(goals.id, id)).all();
  return row;
}

export function createGoal({
  id,
  name,
  targetAmount,
}: {
  id: string;
  name: string;
  targetAmount: number;
}) {
  getUserDb().insert(goals, { id, name, targetAmount }).run();
  return getGoalById(id)!;
}

export function updateGoal(
  id: string,
  { name, targetAmount }: { name: string; targetAmount: number },
) {
  getUserDb().update(goals, { name, targetAmount }, eq(goals.id, id)).run();
  return getGoalById(id)!;
}

export function deleteGoal(id: string) {
  getUserDb().delete(goals, eq(goals.id, id)).run();
}

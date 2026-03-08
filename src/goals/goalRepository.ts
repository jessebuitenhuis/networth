import { eq } from "drizzle-orm";

import { goals } from "@/db/schema";
import { getDb } from "@/db/userDb";

export async function getAllGoals() {
  return (await getDb()).select(goals).all();
}

export async function getGoalById(id: string) {
  const [row] = (await getDb()).select(goals, eq(goals.id, id)).all();
  return row;
}

export async function createGoal({
  id,
  name,
  targetAmount,
}: {
  id: string;
  name: string;
  targetAmount: number;
}) {
  (await getDb()).insert(goals, { id, name, targetAmount }).run();
  return (await getGoalById(id))!;
}

export async function updateGoal(
  id: string,
  { name, targetAmount }: { name: string; targetAmount: number },
) {
  (await getDb()).update(goals, { name, targetAmount }, eq(goals.id, id)).run();
  return (await getGoalById(id))!;
}

export async function deleteGoal(id: string) {
  (await getDb()).delete(goals, eq(goals.id, id)).run();
}

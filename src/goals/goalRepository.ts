import { eq } from "drizzle-orm";

import { goals } from "@/db/schema";
import { getUserDb } from "@/db/userDb";

export async function getAllGoals() {
  return (await getUserDb()).select(goals).all();
}

export async function getGoalById(id: string) {
  const [row] = (await getUserDb()).select(goals, eq(goals.id, id)).all();
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
  (await getUserDb()).insert(goals, { id, name, targetAmount }).run();
  return (await getGoalById(id))!;
}

export async function updateGoal(
  id: string,
  { name, targetAmount }: { name: string; targetAmount: number },
) {
  (await getUserDb()).update(goals, { name, targetAmount }, eq(goals.id, id)).run();
  return (await getGoalById(id))!;
}

export async function deleteGoal(id: string) {
  (await getUserDb()).delete(goals, eq(goals.id, id)).run();
}

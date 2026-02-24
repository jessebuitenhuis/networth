import { and, eq } from "drizzle-orm";

import { db } from "@/db/connection";
import { goals } from "@/db/schema";
import { getCurrentUserId } from "@/lib/getCurrentUserId";

export function getAllGoals() {
  const userId = getCurrentUserId();
  return db.select().from(goals).where(eq(goals.userId, userId)).all();
}

export function getGoalById(id: string) {
  const userId = getCurrentUserId();
  const [row] = db
    .select()
    .from(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, userId)))
    .all();
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
  const userId = getCurrentUserId();
  db.insert(goals).values({ id, userId, name, targetAmount }).run();

  return getGoalById(id)!;
}

export function updateGoal(
  id: string,
  { name, targetAmount }: { name: string; targetAmount: number },
) {
  const userId = getCurrentUserId();
  db.update(goals)
    .set({ name, targetAmount })
    .where(and(eq(goals.id, id), eq(goals.userId, userId)))
    .run();

  return getGoalById(id)!;
}

export function deleteGoal(id: string) {
  const userId = getCurrentUserId();
  db.delete(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, userId)))
    .run();
}

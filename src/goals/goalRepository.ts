import { eq } from "drizzle-orm";

import { db } from "@/db/connection";
import { goals } from "@/db/schema";

export function getAllGoals() {
  return db.select().from(goals).all();
}

export function getGoalById(id: string) {
  const [row] = db
    .select()
    .from(goals)
    .where(eq(goals.id, id))
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
  db.insert(goals).values({ id, name, targetAmount }).run();

  return getGoalById(id)!;
}

export function updateGoal(
  id: string,
  { name, targetAmount }: { name: string; targetAmount: number },
) {
  db.update(goals)
    .set({ name, targetAmount })
    .where(eq(goals.id, id))
    .run();

  return getGoalById(id)!;
}

export function deleteGoal(id: string) {
  db.delete(goals).where(eq(goals.id, id)).run();
}

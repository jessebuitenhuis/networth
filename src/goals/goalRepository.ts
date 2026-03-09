import { BaseRepository } from "@/db/BaseRepository";
import { goals } from "@/db/schema";

class GoalRepository extends BaseRepository<typeof goals> {
  constructor() {
    super(goals, goals.id);
  }

  async createGoal({
    id,
    name,
    targetAmount,
  }: {
    id: string;
    name: string;
    targetAmount: number;
  }) {
    return this.create({ id, name, targetAmount });
  }

  async updateGoal(
    id: string,
    { name, targetAmount }: { name: string; targetAmount: number },
  ) {
    return this.update(id, { name, targetAmount });
  }
}

export const goalRepo = new GoalRepository();

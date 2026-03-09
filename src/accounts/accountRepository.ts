import { BaseRepository } from "@/db/BaseRepository";
import { accounts } from "@/db/schema";

class AccountRepository extends BaseRepository<typeof accounts> {
  constructor() {
    super(accounts, accounts.id);
  }

  async createAccount({
    id,
    name,
    type,
    expectedReturnRate,
  }: {
    id: string;
    name: string;
    type: string;
    expectedReturnRate?: number | null;
  }) {
    return this.create({ id, name, type, expectedReturnRate: expectedReturnRate ?? null });
  }

  async updateAccount(
    id: string,
    {
      name,
      type,
      expectedReturnRate,
    }: {
      name: string;
      type: string;
      expectedReturnRate?: number | null;
    },
  ) {
    return this.update(id, { name, type, expectedReturnRate: expectedReturnRate ?? null });
  }
}

export const accountRepo = new AccountRepository();

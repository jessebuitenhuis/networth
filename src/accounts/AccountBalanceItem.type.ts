import type { AccountType } from "@/accounts/AccountType";

export type AccountBalanceItem = {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
};

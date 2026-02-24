import type { AccountType } from "@/accounts/AccountType";

export type WizardAccountEntry = {
  tempId: string;
  name: string;
  type: AccountType;
  balance: number;
  expectedReturnRate?: number;
};

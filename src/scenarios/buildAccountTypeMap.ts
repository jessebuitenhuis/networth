import type { Account } from "@/accounts/Account.type";
import { AccountType } from "@/accounts/AccountType";

export function buildAccountTypeMap(
  accounts: Account[]
): Map<string, AccountType> {
  return new Map(accounts.map((a) => [a.id, a.type]));
}

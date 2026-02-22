import type { Account } from "./Account.type";
import { AccountType } from "./AccountType";

export interface NetWorthResult {
  total: number;
  assets: number;
  liabilities: number;
}

export function calculateNetWorth(
  accounts: Account[],
  getBalance: (accountId: string) => number,
): NetWorthResult {
  let assets = 0;
  let liabilities = 0;

  for (const a of accounts) {
    const balance = getBalance(a.id);
    if (a.type === AccountType.Asset) {
      assets += balance;
    } else {
      liabilities += balance;
    }
  }

  return { total: assets - liabilities, assets, liabilities };
}

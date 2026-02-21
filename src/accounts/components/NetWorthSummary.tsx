"use client";

import { useAccounts } from "@/accounts/AccountContext";
import { AccountType } from "@/accounts/AccountType";
import { useTransactions } from "@/transactions/TransactionContext";

import { NetWorthCard } from "./NetWorthCard";

export function NetWorthSummary() {
  const { accounts } = useAccounts();
  const { getBalance } = useTransactions();

  let totalAssets = 0;
  let totalLiabilities = 0;

  for (const a of accounts) {
    const balance = getBalance(a.id);
    if (a.type === AccountType.Asset) {
      totalAssets += balance;
    } else {
      totalLiabilities += balance;
    }
  }

  return (
    <NetWorthCard
      netWorth={totalAssets - totalLiabilities}
      totalAssets={totalAssets}
      totalLiabilities={totalLiabilities}
    />
  );
}

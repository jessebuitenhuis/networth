"use client";

import { useAccounts } from "@/accounts/AccountContext";
import { calculateNetWorth } from "@/accounts/calculateNetWorth";
import { useTransactions } from "@/transactions/TransactionContext";

import { NetWorthCard } from "./NetWorthCard";

export function NetWorthSummary() {
  const { accounts } = useAccounts();
  const { getBalance } = useTransactions();

  const { total, assets, liabilities } = calculateNetWorth(accounts, getBalance);

  return (
    <NetWorthCard
      netWorth={total}
      totalAssets={assets}
      totalLiabilities={liabilities}
    />
  );
}

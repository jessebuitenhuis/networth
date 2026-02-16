"use client";

import { AccountType } from "@/accounts/AccountType";
import { useAccounts } from "@/context/AccountContext";
import { useTransactions } from "@/context/TransactionContext";

import { NetWorthCard } from "./NetWorthCard";

export function NetWorthSummary() {
  const { accounts } = useAccounts();
  const { getBalance } = useTransactions();

  const netWorth = accounts.reduce((sum, a) => {
    const balance = getBalance(a.id);
    return a.type === AccountType.Asset ? sum + balance : sum - balance;
  }, 0);

  return <NetWorthCard netWorth={netWorth} />;
}

"use client";

import { useAccounts } from "@/accounts/AccountContext";
import { AccountType } from "@/accounts/AccountType";
import { useTransactions } from "@/transactions/TransactionContext";

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

"use client";

import { useMemo } from "react";

import { AccountType } from "@/accounts/AccountType";
import { useTransactions } from "@/transactions/TransactionContext";

import type { Account } from "./Account.type";
import { calculateNetWorth, type NetWorthResult } from "./calculateNetWorth";

export type AccountNetWorth = NetWorthResult & {
  assetAccounts: Account[];
  liabilityAccounts: Account[];
  getBalance: (accountId: string) => number;
};

export function useAccountNetWorth(accounts: Account[]): AccountNetWorth {
  const { getBalance } = useTransactions();

  const { assetAccounts, liabilityAccounts } = useMemo(() => ({
    assetAccounts: accounts.filter((a) => a.type === AccountType.Asset),
    liabilityAccounts: accounts.filter((a) => a.type === AccountType.Liability),
  }), [accounts]);

  const netWorth = calculateNetWorth(accounts, getBalance);

  return { ...netWorth, assetAccounts, liabilityAccounts, getBalance };
}

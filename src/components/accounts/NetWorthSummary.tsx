"use client";

import { useAccounts } from "@/context/AccountContext";
import { useTransactions } from "@/context/TransactionContext";
import { AccountType } from "@/models/AccountType";

function formatCurrency(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  return amount < 0 ? `-${formatted}` : formatted;
}

export function NetWorthSummary() {
  const { accounts } = useAccounts();
  const { getBalance } = useTransactions();

  const netWorth = accounts.reduce((sum, a) => {
    const balance = getBalance(a.id);
    return a.type === AccountType.Asset ? sum + balance : sum - balance;
  }, 0);

  return (
    <div className="rounded-lg border p-6">
      <h2 className="text-sm font-medium text-muted-foreground">Net Worth</h2>
      <p className="text-3xl font-bold">{formatCurrency(netWorth)}</p>
    </div>
  );
}

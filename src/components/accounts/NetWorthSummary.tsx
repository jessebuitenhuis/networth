"use client";

import { useAccounts } from "@/context/AccountContext";
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

  const netWorth = accounts.reduce((sum, a) => {
    return a.type === AccountType.Asset ? sum + a.balance : sum - a.balance;
  }, 0);

  return (
    <div className="rounded-lg border p-6">
      <h2 className="text-sm font-medium text-muted-foreground">Net Worth</h2>
      <p className="text-3xl font-bold">{formatCurrency(netWorth)}</p>
    </div>
  );
}

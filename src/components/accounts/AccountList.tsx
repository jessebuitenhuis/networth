"use client";

import { useAccounts } from "@/context/AccountContext";
import { useTransactions } from "@/context/TransactionContext";
import { AccountListItem } from "./AccountListItem";

export function AccountList() {
  const { accounts, removeAccount } = useAccounts();
  const { getBalance } = useTransactions();

  if (accounts.length === 0) {
    return <p className="text-muted-foreground">No accounts yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {accounts.map((account) => (
        <AccountListItem
          key={account.id}
          name={account.name}
          type={account.type}
          balance={getBalance(account.id)}
          onRemove={() => removeAccount(account.id)}
        />
      ))}
    </ul>
  );
}

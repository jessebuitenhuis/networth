"use client";

import { useAccounts } from "@/context/AccountContext";
import { Button } from "@/components/ui/button";

export function AccountList() {
  const { accounts, removeAccount } = useAccounts();

  if (accounts.length === 0) {
    return <p className="text-muted-foreground">No accounts yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {accounts.map((account) => (
        <li
          key={account.id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div>
            <span className="font-medium">{account.name}</span>
            <span className="ml-2 text-sm text-muted-foreground">
              {account.type}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono">
              {account.balance.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeAccount(account.id)}
            >
              Remove
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

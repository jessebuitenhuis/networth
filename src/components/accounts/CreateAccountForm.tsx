"use client";

import { useState } from "react";
import { useAccounts } from "@/context/AccountContext";
import { useTransactions } from "@/context/TransactionContext";
import { AccountType } from "@/models/AccountType";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CreateAccountForm() {
  const { addAccount } = useAccounts();
  const { addTransaction } = useTransactions();
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>(AccountType.Asset);
  const [balance, setBalance] = useState(0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const accountId = crypto.randomUUID();

    addAccount({
      id: accountId,
      name: name.trim(),
      type,
    });

    if (balance !== 0) {
      addTransaction({
        id: crypto.randomUUID(),
        accountId,
        amount: balance,
        date: new Date().toISOString().split("T")[0],
        description: "Opening balance",
      });
    }

    setName("");
    setBalance(0);
    setType(AccountType.Asset);
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex-1">
        <label htmlFor="account-name" className="text-sm font-medium">
          Name
        </label>
        <Input
          id="account-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Chase Checking"
        />
      </div>
      <div>
        <label htmlFor="account-type" className="text-sm font-medium">
          Type
        </label>
        <select
          id="account-type"
          value={type}
          onChange={(e) => setType(e.target.value as AccountType)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
        >
          <option value={AccountType.Asset}>Asset</option>
          <option value={AccountType.Liability}>Liability</option>
        </select>
      </div>
      <div>
        <label htmlFor="account-balance" className="text-sm font-medium">
          Balance
        </label>
        <Input
          id="account-balance"
          type="number"
          value={balance}
          onChange={(e) => setBalance(Number(e.target.value))}
        />
      </div>
      <Button type="submit">Add Account</Button>
    </form>
  );
}

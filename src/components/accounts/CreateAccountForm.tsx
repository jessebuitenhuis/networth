"use client";

import { useState } from "react";
import { useAccounts } from "@/context/AccountContext";
import { useTransactions } from "@/context/TransactionContext";
import { AccountType } from "@/models/AccountType";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
        <Label htmlFor="account-name">Name</Label>
        <Input
          id="account-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Chase Checking"
        />
      </div>
      <div>
        <Label id="account-type-label">Type</Label>
        <Select
          value={type}
          onValueChange={(v) => setType(v as AccountType)}
          aria-labelledby="account-type-label"
        >
          <SelectTrigger aria-label="Type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={AccountType.Asset}>Asset</SelectItem>
            <SelectItem value={AccountType.Liability}>Liability</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="account-balance">Balance</Label>
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

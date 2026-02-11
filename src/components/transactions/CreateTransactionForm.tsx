"use client";

import { useState } from "react";
import { useTransactions } from "@/context/TransactionContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type CreateTransactionFormProps = {
  accountId: string;
};

export function CreateTransactionForm({
  accountId,
}: CreateTransactionFormProps) {
  const { addTransaction } = useTransactions();
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [description, setDescription] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (amount === 0) return;

    addTransaction({
      id: crypto.randomUUID(),
      accountId,
      amount,
      date,
      description: description.trim(),
    });

    setAmount(0);
    setDescription("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div>
        <Label htmlFor="tx-amount">Amount</Label>
        <Input
          id="tx-amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>
      <div>
        <Label htmlFor="tx-date">Date</Label>
        <Input
          id="tx-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="flex-1">
        <Label htmlFor="tx-description">Description</Label>
        <Input
          id="tx-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Groceries"
        />
      </div>
      <Button type="submit">Add Transaction</Button>
    </form>
  );
}

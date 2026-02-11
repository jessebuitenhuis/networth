"use client";

import { useState } from "react";
import { useTransactions } from "@/context/TransactionContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
        <label htmlFor="tx-amount" className="text-sm font-medium">
          Amount
        </label>
        <Input
          id="tx-amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </div>
      <div>
        <label htmlFor="tx-date" className="text-sm font-medium">
          Date
        </label>
        <Input
          id="tx-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="flex-1">
        <label htmlFor="tx-description" className="text-sm font-medium">
          Description
        </label>
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

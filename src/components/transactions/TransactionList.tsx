"use client";

import { useTransactions } from "@/context/TransactionContext";
import { Button } from "@/components/ui/button";

type TransactionListProps = {
  accountId: string;
};

function formatAmount(amount: number): string {
  const formatted = Math.abs(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  return amount >= 0 ? `+${formatted}` : `-${formatted}`;
}

export function TransactionList({ accountId }: TransactionListProps) {
  const { transactions, removeTransaction } = useTransactions();

  const filtered = transactions
    .filter((t) => t.accountId === accountId)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (filtered.length === 0) {
    return <p className="text-muted-foreground">No transactions yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {filtered.map((tx) => (
        <li
          key={tx.id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div>
            <span className="font-medium">{tx.description}</span>
            <span className="ml-2 text-sm text-muted-foreground">
              {new Date(tx.date + "T00:00:00").toLocaleDateString("en-US")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`font-mono ${tx.amount >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {formatAmount(tx.amount)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeTransaction(tx.id)}
            >
              Delete
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}

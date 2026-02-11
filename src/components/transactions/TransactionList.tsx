"use client";

import { useTransactions } from "@/context/TransactionContext";
import { isTransactionProjected } from "@/services/isTransactionProjected";
import { TransactionListItem } from "./TransactionListItem";

type TransactionListProps = {
  accountId: string;
};

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
        <TransactionListItem
          key={tx.id}
          description={tx.description}
          date={tx.date}
          amount={tx.amount}
          onDelete={() => removeTransaction(tx.id)}
          isProjected={isTransactionProjected(tx)}
        />
      ))}
    </ul>
  );
}

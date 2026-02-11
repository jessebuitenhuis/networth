"use client";

import { use } from "react";
import { useAccounts } from "@/context/AccountContext";
import { useTransactions } from "@/context/TransactionContext";
import { TransactionList } from "@/components/transactions/TransactionList";
import { CreateTransactionDialog } from "@/components/transactions/CreateTransactionDialog";

type AccountDetailPageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default function AccountDetailPage({ params }: AccountDetailPageProps) {
  const resolvedParams =
    params instanceof Promise ? use(params) : params;
  const { accounts } = useAccounts();
  const { getBalance } = useTransactions();

  const account = accounts.find((a) => a.id === resolvedParams.id);

  if (!account) {
    return <p className="text-muted-foreground">Account not found</p>;
  }

  const balance = getBalance(account.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{account.name}</h1>
      <div className="rounded-lg border p-6">
        <p className="text-sm font-medium text-muted-foreground">
          {account.type} Balance
        </p>
        <p className="text-3xl font-bold">
          {balance.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        </p>
      </div>
      <CreateTransactionDialog accountId={account.id} />
      <TransactionList accountId={account.id} />
    </div>
  );
}

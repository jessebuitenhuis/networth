"use client";

import { use } from "react";

import TopBar from "@/components/layout/TopBar";
import { CreateTransactionDialog } from "@/components/transactions/CreateTransactionDialog";
import { TransactionList } from "@/components/transactions/TransactionList";
import { useAccounts } from "@/context/AccountContext";
import { useTransactions } from "@/context/TransactionContext";
import { getDefaultCurrency } from "@/lib/getLocale";

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
    return (
      <>
        <TopBar />
        <div className="p-4">
          <p className="text-muted-foreground">Account not found</p>
        </div>
      </>
    );
  }

  const balance = getBalance(account.id);

  return (
    <>
      <TopBar title={account.name} />
      <div className="p-4">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="rounded-lg border p-6">
            <p className="text-sm font-medium text-muted-foreground">
              {account.type} Balance
            </p>
            <p className="text-3xl font-bold">
              {balance.toLocaleString(undefined, {
                style: "currency",
                currency: getDefaultCurrency(),
              })}
            </p>
          </div>
          <CreateTransactionDialog accountId={account.id} />
          <TransactionList accountId={account.id} />
        </div>
      </div>
    </>
  );
}

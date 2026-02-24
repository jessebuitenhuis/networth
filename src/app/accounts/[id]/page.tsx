"use client";

import { use } from "react";

import { useAccounts } from "@/accounts/AccountContext";
import { UpdateBalanceDialog } from "@/accounts/components/UpdateBalanceDialog";
import { computeBalance } from "@/accounts/computeBalance";
import TopBar from "@/components/layout/TopBar";
import { formatDate } from "@/lib/dateUtils";
import { getBrowserLocale, getDefaultCurrency } from "@/lib/getLocale";
import { ScenarioFilterSelect } from "@/scenarios/components/ScenarioFilterSelect";
import { useScenarios } from "@/scenarios/ScenarioContext";
import { CreateTransactionDialog } from "@/transactions/components/CreateTransactionDialog";
import { TransactionList } from "@/transactions/components/TransactionList";
import { filterTransactionsByScenario } from "@/transactions/filterTransactionsByScenario";
import { ImportCsvDialog } from "@/transactions/import/ImportCsvDialog";
import { useTransactions } from "@/transactions/TransactionContext";

type AccountDetailPageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default function AccountDetailPage({ params }: AccountDetailPageProps) {
  const resolvedParams =
    params instanceof Promise ? use(params) : params;
  const { accounts } = useAccounts();
  const { transactions, addTransaction } = useTransactions();
  const { scenarios, activeScenarioId, setActiveScenario } = useScenarios();

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

  const effectiveScenarioId =
    activeScenarioId && scenarios.some((s) => s.id === activeScenarioId)
      ? activeScenarioId
      : null;

  const filteredTransactions = filterTransactionsByScenario(
    transactions,
    effectiveScenarioId
  );

  const balance = computeBalance(
    account.id,
    filteredTransactions,
    formatDate(new Date())
  );

  return (
    <>
      <TopBar
        title={account.name}
        actions={
          <ScenarioFilterSelect
            scenarios={scenarios}
            value={effectiveScenarioId}
            onValueChange={setActiveScenario}
          />
        }
      />
      <div className="p-6">
        <div className="space-y-6">
          <div className="surface-section p-8">
            <p className="section-label">{account.type} Balance</p>
            <p className="hero-value mt-2 text-4xl font-normal leading-none">
              {balance.toLocaleString(getBrowserLocale(), {
                style: "currency",
                currency: getDefaultCurrency(),
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <CreateTransactionDialog accountId={account.id} />
            <UpdateBalanceDialog accountId={account.id} transactions={transactions} onSave={addTransaction} />
            <ImportCsvDialog accountId={account.id} />
          </div>
          <TransactionList accountId={account.id} />
        </div>
      </div>
    </>
  );
}

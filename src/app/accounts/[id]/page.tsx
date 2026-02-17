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
  // AGENT: Why is this either a promise or not a promise? Can we choose one?
  params: Promise<{ id: string }> | { id: string };
};

export default function AccountDetailPage({ params }: AccountDetailPageProps) {
  const resolvedParams =
    params instanceof Promise ? use(params) : params;
  const { accounts } = useAccounts();
  const { transactions, addTransaction } = useTransactions();
  const { scenarios, activeScenarioId, setActiveScenario } = useScenarios();

  // AGENT: Can we export a findAccount from useAccounts instead of doing this inline?
  const account = accounts.find((a) => a.id === resolvedParams.id);

  if (!account) {
    // AGENT: It would be nice to create an EmptyAccountDetailPage component that is rendered here. This makes it very clear what this does. The code "reads like a book"
    return (
      <>
        <TopBar />
        <div className="p-4">
          <p className="text-muted-foreground">Account not found</p>
        </div>
      </>
    );
  }

  // AGENT: Single responsibility: doesn't this code belong in the useScenarios hook or some service?
  const effectiveScenarioId =
    activeScenarioId && scenarios.some((s) => s.id === activeScenarioId)
      ? activeScenarioId
      : null;

  // AGENT: Should this be done in the useScenarios() hook?
  const filteredTransactions = filterTransactionsByScenario(
    transactions,
    effectiveScenarioId
  );

  // AGENT: Why do we have to format the date for a calculation function? Can't we just pass in the date and let the computeBalance function handle the comparison?
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
      <div className="p-4">
        <div className="space-y-6">
          {/* AGENT: can we extract this to a component? */}
          <div className="rounded-lg border p-6">
            <p className="text-sm font-medium text-muted-foreground">
              {account.type} Balance
            </p>
            <p className="text-3xl font-bold">
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

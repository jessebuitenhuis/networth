"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";

import type { Account } from "@/accounts/Account.type";
import { useAccounts } from "@/accounts/AccountContext";
import { AccountType } from "@/accounts/AccountType";
import { calculateNetWorth } from "@/accounts/calculateNetWorth";
import { AccountIcon } from "@/accounts/components/AccountIcon";
import { CreateAccountDialog } from "@/accounts/components/CreateAccountDialog";
import { EditAccountDialog } from "@/accounts/components/EditAccountDialog";
import { EmptyDashboard } from "@/accounts/components/EmptyDashboard";
import { NetWorthSummary } from "@/accounts/components/NetWorthSummary";
import TopBar from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatCurrency";
import { useTransactions } from "@/transactions/TransactionContext";

export default function AccountsPage() {
  const { accounts } = useAccounts();
  const { getBalance } = useTransactions();

  const { assets: totalAssets, liabilities: totalLiabilities } = calculateNetWorth(
    accounts,
    getBalance
  );

  const assets = accounts.filter((a) => a.type === AccountType.Asset);
  const liabilities = accounts.filter((a) => a.type === AccountType.Liability);

  if (accounts.length === 0) {
    return (
      <>
        <TopBar
          title="Accounts"
          actions={<CreateAccountDialog trigger={<Button>Add Account</Button>} />}
        />
        <div className="flex justify-center p-4">
          <div className="w-full max-w-2xl">
            <EmptyDashboard
              createAccountTrigger={
                <CreateAccountDialog trigger={<Button>Add Account</Button>} />
              }
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar
        title="Accounts"
        actions={<CreateAccountDialog trigger={<Button>Add Account</Button>} />}
      />
      <div className="flex justify-center p-4">
        <div className="w-full max-w-2xl space-y-6">
          <NetWorthSummary />
          <AccountSection
            title="Assets"
            accounts={assets}
            subtotal={totalAssets}
            getBalance={getBalance}
          />
          {liabilities.length > 0 && (
            <AccountSection
              title="Liabilities"
              accounts={liabilities}
              subtotal={totalLiabilities}
              getBalance={getBalance}
            />
          )}
        </div>
      </div>
    </>
  );
}

type AccountSectionProps = {
  title: string;
  accounts: Account[];
  subtotal: number;
  getBalance: (accountId: string) => number;
};

function AccountSection({ title, accounts, subtotal, getBalance }: AccountSectionProps) {
  if (accounts.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
        <span className="text-sm font-medium">{formatCurrency(subtotal)}</span>
      </div>
      <div className="rounded-lg border divide-y">
        {accounts.map((account) => (
          <div key={account.id} className="flex items-center gap-3 px-4 py-3">
            <AccountIcon name={account.name} type={account.type} />
            <Link
              href={`/accounts/${account.id}`}
              className="flex-1 text-sm font-medium hover:underline"
            >
              {account.name}
            </Link>
            <span className="text-sm text-muted-foreground">
              {formatCurrency(getBalance(account.id))}
            </span>
            <EditAccountDialog
              account={account}
              trigger={
                <Button variant="ghost" size="icon" aria-label={`Edit ${account.name}`}>
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";

import type { Account } from "@/accounts/Account.type";
import { useAccounts } from "@/accounts/AccountContext";
import { AccountListSection } from "@/accounts/components/AccountListSection";
import { CreateAccountDialog } from "@/accounts/components/CreateAccountDialog";
import { EditAccountDialog } from "@/accounts/components/EditAccountDialog";
import { NetWorthCard } from "@/accounts/components/NetWorthCard";
import { useAccountNetWorth } from "@/accounts/useAccountNetWorth";
import TopBar from "@/components/layout/TopBar";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatCurrency";

function AccountRow({ account, balance }: { account: Account; balance: number }) {
  return (
    <>
      <Link
        href={`/accounts/${account.id}`}
        className="flex-1 truncate text-sm text-foreground/90 transition-colors hover:text-primary"
      >
        {account.name}
      </Link>
      <span className="font-mono text-sm font-medium">{formatCurrency(balance)}</span>
      <EditAccountDialog
        account={account}
        trigger={
          <Button variant="ghost" size="icon" aria-label={`Edit ${account.name}`}>
            <Pencil className="h-4 w-4" />
          </Button>
        }
      />
    </>
  );
}

export default function AccountsPage() {
  const { accounts } = useAccounts();
  const { total, assets, liabilities, assetAccounts, liabilityAccounts, getBalance } =
    useAccountNetWorth(accounts);

  return (
    <>
      <TopBar
        title="Accounts"
        actions={<CreateAccountDialog trigger={<Button>New Account</Button>} />}
      />
      <div className="p-6">
        <div className="mx-auto max-w-2xl space-y-8">
          <NetWorthCard
            netWorth={total}
            totalAssets={assets}
            totalLiabilities={liabilities}
          />
          <AccountListSection
            title="Assets"
            total={assets}
            accounts={assetAccounts}
            getBalance={getBalance}
            renderRow={(account, balance) => (
              <AccountRow account={account} balance={balance} />
            )}
          />
          <AccountListSection
            title="Liabilities"
            total={liabilities}
            accounts={liabilityAccounts}
            getBalance={getBalance}
            renderRow={(account, balance) => (
              <AccountRow account={account} balance={balance} />
            )}
          />
        </div>
      </div>
    </>
  );
}

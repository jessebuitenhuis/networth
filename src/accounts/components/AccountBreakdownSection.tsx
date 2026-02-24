"use client";

import type { Account } from "@/accounts/Account.type";
import { useAccounts } from "@/accounts/AccountContext";
import { useAccountNetWorth } from "@/accounts/useAccountNetWorth";
import { formatCurrency } from "@/lib/formatCurrency";

import { AccountListSection } from "./AccountListSection";

function BalanceRow({ account, balance }: { account: Account; balance: number }) {
  return (
    <>
      <span className="flex-1 truncate text-sm">{account.name}</span>
      <span className="text-sm font-medium">{formatCurrency(balance)}</span>
    </>
  );
}

export function AccountBreakdownSection() {
  const { accounts } = useAccounts();
  const { assets, liabilities, assetAccounts, liabilityAccounts, getBalance } =
    useAccountNetWorth(accounts);

  if (accounts.length === 0) return null;

  return (
    <div className="space-y-4">
      <AccountListSection
        title="Assets"
        total={assets}
        accounts={assetAccounts}
        getBalance={getBalance}
        renderRow={(account, balance) => (
          <BalanceRow account={account} balance={balance} />
        )}
      />
      <AccountListSection
        title="Liabilities"
        total={liabilities}
        accounts={liabilityAccounts}
        getBalance={getBalance}
        renderRow={(account, balance) => (
          <BalanceRow account={account} balance={balance} />
        )}
      />
    </div>
  );
}

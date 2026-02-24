import type { ReactNode } from "react";

import type { Account } from "@/accounts/Account.type";
import { AccountIcon } from "@/accounts/components/AccountIcon";
import { formatCurrency } from "@/lib/formatCurrency";

type AccountListSectionProps = {
  title: string;
  total: number;
  accounts: Account[];
  getBalance: (accountId: string) => number;
  renderRow: (account: Account, balance: number) => ReactNode;
};

export function AccountListSection({
  title,
  total,
  accounts,
  getBalance,
  renderRow,
}: AccountListSectionProps) {
  if (accounts.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="section-label">{title}</h3>
        <span className="font-display text-sm text-gold">{formatCurrency(total)}</span>
      </div>
      <div className="surface-list">
        {accounts.map((account) => {
          const balance = getBalance(account.id);
          return (
            <div
              key={account.id}
              className="surface-list-row flex items-center gap-3 px-4 py-3"
            >
              <AccountIcon name={account.name} type={account.type} />
              {renderRow(account, balance)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import type { AccountBalanceItem } from "@/accounts/AccountBalanceItem.type";
import { useAccounts } from "@/accounts/AccountContext";
import { AccountType } from "@/accounts/AccountType";
import { calculateNetWorth } from "@/accounts/calculateNetWorth";
import { useTransactions } from "@/transactions/TransactionContext";

import { AccountBalanceList } from "./AccountBalanceList";

export function AccountBreakdownSection() {
  const { accounts } = useAccounts();
  const { getBalance } = useTransactions();

  if (accounts.length === 0) return null;

  const { assets: totalAssets, liabilities: totalLiabilities } = calculateNetWorth(
    accounts,
    getBalance,
  );

  const toItem = (a: { id: string; name: string; type: AccountType }): AccountBalanceItem => ({
    id: a.id,
    name: a.name,
    type: a.type,
    balance: getBalance(a.id),
  });

  const assets = accounts.filter((a) => a.type === AccountType.Asset).map(toItem);
  const liabilities = accounts.filter((a) => a.type === AccountType.Liability).map(toItem);

  return (
    <div className="space-y-4">
      <AccountBalanceList title="Assets" accounts={assets} subtotal={totalAssets} />
      <AccountBalanceList title="Liabilities" accounts={liabilities} subtotal={totalLiabilities} />
    </div>
  );
}

import type { AccountBalanceItem } from "@/accounts/AccountBalanceItem.type";
import { AccountIcon } from "@/accounts/components/AccountIcon";
import { formatCurrency } from "@/lib/formatCurrency";

interface AccountBalanceListProps {
  title: string;
  accounts: AccountBalanceItem[];
  subtotal: number;
}

export function AccountBalanceList({ title, accounts, subtotal }: AccountBalanceListProps) {
  if (accounts.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
        <span className="text-sm font-medium">{formatCurrency(subtotal)}</span>
      </div>
      <div className="divide-y rounded-lg border">
        {accounts.map((account) => (
          <div key={account.id} className="flex items-center gap-3 px-4 py-3">
            <AccountIcon name={account.name} type={account.type} />
            <span className="flex-1 text-sm font-medium">{account.name}</span>
            <span className="text-sm text-muted-foreground">{formatCurrency(account.balance)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

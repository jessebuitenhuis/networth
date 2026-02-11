import { Button } from "@/components/ui/button";
import type { Account } from "@/models/Account";

type ChartLegendProps = {
  accounts: Account[];
  excludedIds: Set<string>;
  onToggle: (id: string) => void;
};

export function ChartLegend({ accounts, excludedIds, onToggle }: ChartLegendProps) {
  if (accounts.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {accounts.map((account) => {
        const isIncluded = !excludedIds.has(account.id);
        return (
          <Button
            key={account.id}
            variant={isIncluded ? "default" : "outline"}
            size="sm"
            aria-pressed={isIncluded}
            onClick={() => onToggle(account.id)}
          >
            {account.name}
          </Button>
        );
      })}
    </div>
  );
}

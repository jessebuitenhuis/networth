import { getAccountColor } from "@/lib/chartColors";
import type { Account } from "@/models/Account.type";

type ChartLegendProps = {
  accounts: Account[];
  excludedIds: Set<string>;
  onToggle: (id: string) => void;
};

export function ChartLegend({ accounts, excludedIds, onToggle }: ChartLegendProps) {
  if (accounts.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {accounts.map((account, index) => {
        const isIncluded = !excludedIds.has(account.id);
        return (
          <button
            key={account.id}
            className={`flex items-center gap-1.5 text-sm ${isIncluded ? "" : "opacity-40"}`}
            aria-pressed={isIncluded}
            onClick={() => onToggle(account.id)}
          >
            <span
              data-testid="legend-dot"
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: getAccountColor(index) }}
            />
            {account.name}
          </button>
        );
      })}
    </div>
  );
}

import type { CSSProperties } from "react";

import type { Account } from "@/accounts/Account.type";
import { getAccountColor } from "@/charts/chartColors";
import { Button } from "@/components/ui/button";

type ChartLegendProps = {
  accounts: Account[];
  excludedIds: Set<string>;
  onToggle: (id: string) => void;
};

export function ChartLegend({ accounts, excludedIds, onToggle }: ChartLegendProps) {
  if (accounts.length === 0) return null;

  return (
    <div className="surface-legend flex flex-wrap justify-center gap-2 rounded-lg px-3 py-2">
      {accounts.map((account, index) => {
        const isIncluded = !excludedIds.has(account.id);
        const color = getAccountColor(index);
        return (
          <Button
            key={account.id}
            variant="ghost"
            size="sm"
            className={`flex items-center gap-1.5 text-xs ${isIncluded ? "" : "opacity-30"}`}
            aria-pressed={isIncluded}
            onClick={() => onToggle(account.id)}
          >
            <span
              data-testid="legend-dot"
              className="legend-dot inline-block h-2 w-2 rounded-full"
              style={{ "--dot-color": color } as React.CSSProperties}
              data-included={isIncluded}
            />
            {account.name}
          </Button>
        );
      })}
    </div>
  );
}

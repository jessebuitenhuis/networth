import { AccountType } from "@/accounts/AccountType";
import { PercentageInput } from "@/components/shared/PercentageInput";
import { Label } from "@/components/ui/label";

import type { WizardAccountEntry } from "../WizardAccountEntry.type";

type GrowthStepProps = {
  accounts: WizardAccountEntry[];
  onUpdate: (tempId: string, updates: Partial<WizardAccountEntry>) => void;
};

export function GrowthStep({ accounts, onUpdate }: GrowthStepProps) {
  const assetAccounts = accounts.filter((a) => a.type === AccountType.Asset);

  if (assetAccounts.length === 0) {
    return (
      <p className="text-muted-foreground">
        Add asset accounts in the first step to set expected growth rates.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {assetAccounts.map((account) => (
        <div key={account.tempId} className="flex items-center gap-4">
          <Label className="min-w-0 flex-1 truncate">{account.name}</Label>
          <div className="w-32">
            <PercentageInput
              value={
                account.expectedReturnRate != null
                  ? String(account.expectedReturnRate)
                  : ""
              }
              onChange={(value) =>
                onUpdate(account.tempId, {
                  expectedReturnRate: value ? Number(value) : undefined,
                })
              }
              aria-label={`${account.name} return rate`}
              placeholder="e.g. 7"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

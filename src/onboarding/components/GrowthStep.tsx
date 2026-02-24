import { AccountType } from "@/accounts/AccountType";

import type { WizardAccountEntry } from "../WizardAccountEntry.type";
import { GrowthRow } from "./GrowthRow";

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
        <GrowthRow
          key={account.tempId}
          account={account}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}

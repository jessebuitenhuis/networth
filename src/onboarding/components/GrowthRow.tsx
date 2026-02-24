import { PercentageInput } from "@/components/shared/PercentageInput";
import { Label } from "@/components/ui/label";

import type { WizardAccountEntry } from "../WizardAccountEntry.type";

type GrowthRowProps = {
  account: WizardAccountEntry;
  onUpdate: (tempId: string, updates: Partial<WizardAccountEntry>) => void;
};

export function GrowthRow({ account, onUpdate }: GrowthRowProps) {
  return (
    <div className="flex items-center gap-4">
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
  );
}

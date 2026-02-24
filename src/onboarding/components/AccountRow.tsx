import { X } from "lucide-react";

import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { WizardAccountEntry } from "../WizardAccountEntry.type";

type AccountRowProps = {
  account: WizardAccountEntry;
  onUpdate: (tempId: string, updates: Partial<WizardAccountEntry>) => void;
  onRemove: (tempId: string) => void;
};

export function AccountRow({ account, onUpdate, onRemove }: AccountRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <Input
        className="min-w-0 flex-1"
        value={account.name}
        onChange={(e) => onUpdate(account.tempId, { name: e.target.value })}
        aria-label={`${account.name} name`}
      />
      <span className="text-xs text-muted-foreground">{account.type}</span>
      <div className="w-40">
        <CurrencyInput
          value={account.balance}
          onChange={(balance) => onUpdate(account.tempId, { balance })}
          aria-label={`${account.name} balance`}
          showSignToggle={false}
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(account.tempId)}
        aria-label={`Remove ${account.name}`}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

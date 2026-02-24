import { X } from "lucide-react";

import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { WizardAccountEntry } from "../WizardAccountEntry.type";
import type { WizardRecurringEntry } from "../WizardRecurringEntry.type";

type RecurringEntryRowProps = {
  entry: WizardRecurringEntry;
  accounts: WizardAccountEntry[];
  onUpdate: (tempId: string, updates: Partial<WizardRecurringEntry>) => void;
  onRemove: (tempId: string) => void;
};

export function RecurringEntryRow({
  entry,
  accounts,
  onUpdate,
  onRemove,
}: RecurringEntryRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <Input
        className="min-w-0 flex-shrink-0"
        value={entry.description}
        onChange={(e) =>
          onUpdate(entry.tempId, { description: e.target.value })
        }
        aria-label={`${entry.description} description`}
      />
      <div className="w-40">
        <CurrencyInput
          value={entry.amount}
          onChange={(amount) => onUpdate(entry.tempId, { amount })}
          aria-label={`${entry.description} amount`}
        />
      </div>
      <div className="w-36">
        <Select
          value={entry.accountTempId}
          onValueChange={(accountTempId) =>
            onUpdate(entry.tempId, { accountTempId })
          }
        >
          <SelectTrigger aria-label={`${entry.description} account`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((a) => (
              <SelectItem key={a.tempId} value={a.tempId}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(entry.tempId)}
        aria-label={`Remove ${entry.description}`}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

import { X } from "lucide-react";

import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { Button } from "@/components/ui/button";

import type { AccountSuggestion } from "../accountSuggestions";
import { accountSuggestions } from "../accountSuggestions";
import type { WizardAccountEntry } from "../WizardAccountEntry.type";

type AccountsStepProps = {
  accounts: WizardAccountEntry[];
  onAdd: (account: WizardAccountEntry) => void;
  onRemove: (tempId: string) => void;
  onUpdate: (tempId: string, updates: Partial<WizardAccountEntry>) => void;
  generateTempId: () => string;
};

export function AccountsStep({
  accounts,
  onAdd,
  onRemove,
  onUpdate,
  generateTempId,
}: AccountsStepProps) {
  const addedNames = new Set(accounts.map((a) => a.name));

  function handleSuggestionClick(suggestion: AccountSuggestion) {
    onAdd({
      tempId: generateTempId(),
      name: suggestion.name,
      type: suggestion.type,
      balance: 0,
      expectedReturnRate: suggestion.defaultReturnRate,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {accountSuggestions
          .filter((s) => !addedNames.has(s.name))
          .map((suggestion) => (
            <Button
              key={suggestion.name}
              variant="outline"
              size="sm"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.emoji} {suggestion.name}
            </Button>
          ))}
      </div>
      {accounts.length > 0 && (
        <div className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.tempId}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {account.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {account.type}
              </span>
              <div className="w-40">
                <CurrencyInput
                  value={account.balance}
                  onChange={(balance) =>
                    onUpdate(account.tempId, { balance })
                  }
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
          ))}
        </div>
      )}
    </div>
  );
}

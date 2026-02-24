import { Button } from "@/components/ui/button";

import type { AccountSuggestion } from "../accountSuggestions";
import { accountSuggestions } from "../accountSuggestions";
import type { WizardAccountEntry } from "../WizardAccountEntry.type";
import { AccountRow } from "./AccountRow";

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
            <AccountRow
              key={account.tempId}
              account={account}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

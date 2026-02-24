import { X } from "lucide-react";

import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { RecurringSuggestion } from "../recurringSuggestions";
import { recurringSuggestions } from "../recurringSuggestions";
import type { WizardAccountEntry } from "../WizardAccountEntry.type";
import type { WizardRecurringEntry } from "../WizardRecurringEntry.type";

type IncomeExpensesStepProps = {
  entries: WizardRecurringEntry[];
  accounts: WizardAccountEntry[];
  onAdd: (entry: WizardRecurringEntry) => void;
  onRemove: (tempId: string) => void;
  onUpdate: (tempId: string, updates: Partial<WizardRecurringEntry>) => void;
  generateTempId: () => string;
};

export function IncomeExpensesStep({
  entries,
  accounts,
  onAdd,
  onRemove,
  onUpdate,
  generateTempId,
}: IncomeExpensesStepProps) {
  const addedDescriptions = new Set(entries.map((e) => e.description));
  const defaultAccountId = accounts[0]?.tempId ?? "";

  function handleSuggestionClick(suggestion: RecurringSuggestion) {
    onAdd({
      tempId: generateTempId(),
      description: suggestion.description,
      amount: suggestion.isIncome ? 0 : -0,
      accountTempId: defaultAccountId,
    });
  }

  const incomeSuggestions = recurringSuggestions.filter((s) => s.isIncome);
  const expenseSuggestions = recurringSuggestions.filter((s) => !s.isIncome);

  return (
    <div className="space-y-6">
      {accounts.length === 0 ? (
        <p className="text-muted-foreground">
          Add accounts in the previous step to set up recurring income and expenses.
        </p>
      ) : (
        <>
          <SuggestionSection
            label="Income"
            suggestions={incomeSuggestions}
            addedDescriptions={addedDescriptions}
            onSuggestionClick={handleSuggestionClick}
          />
          <SuggestionSection
            label="Expenses"
            suggestions={expenseSuggestions}
            addedDescriptions={addedDescriptions}
            onSuggestionClick={handleSuggestionClick}
          />
          {entries.length > 0 && (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.tempId}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <span className="min-w-0 flex-shrink-0 text-sm font-medium">
                    {entry.description}
                  </span>
                  <div className="w-40">
                    <CurrencyInput
                      value={entry.amount}
                      onChange={(amount) =>
                        onUpdate(entry.tempId, { amount })
                      }
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
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SuggestionSection({
  label,
  suggestions,
  addedDescriptions,
  onSuggestionClick,
}: {
  label: string;
  suggestions: RecurringSuggestion[];
  addedDescriptions: Set<string>;
  onSuggestionClick: (s: RecurringSuggestion) => void;
}) {
  const available = suggestions.filter(
    (s) => !addedDescriptions.has(s.description),
  );

  if (available.length === 0) return null;

  return (
    <div>
      <Label className="mb-2">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {available.map((suggestion) => (
          <Button
            key={suggestion.description}
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion.emoji} {suggestion.description}
          </Button>
        ))}
      </div>
    </div>
  );
}

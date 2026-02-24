import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import type { RecurringSuggestion } from "../recurringSuggestions";
import { recurringSuggestions } from "../recurringSuggestions";
import type { WizardAccountEntry } from "../WizardAccountEntry.type";
import type { WizardRecurringEntry } from "../WizardRecurringEntry.type";
import { RecurringEntryRow } from "./RecurringEntryRow";

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
                <RecurringEntryRow
                  key={entry.tempId}
                  entry={entry}
                  accounts={accounts}
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                />
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

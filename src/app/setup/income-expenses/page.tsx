"use client";

import { generateId } from "@/lib/generateId";
import { IncomeExpensesStep } from "@/onboarding/components/IncomeExpensesStep";
import { useWizard } from "@/onboarding/WizardContext";

export default function IncomeExpensesPage() {
  const wizard = useWizard();

  return (
    <IncomeExpensesStep
      entries={wizard.data.recurringEntries}
      accounts={wizard.data.accounts}
      onAdd={wizard.addRecurringEntry}
      onRemove={wizard.removeRecurringEntry}
      onUpdate={wizard.updateRecurringEntry}
      generateTempId={generateId}
    />
  );
}

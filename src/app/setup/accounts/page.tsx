"use client";

import { generateId } from "@/lib/generateId";
import { AccountsStep } from "@/onboarding/components/AccountsStep";
import { useWizard } from "@/onboarding/WizardContext";

export default function AccountsPage() {
  const wizard = useWizard();

  return (
    <AccountsStep
      accounts={wizard.data.accounts}
      onAdd={wizard.addAccount}
      onRemove={wizard.removeAccount}
      onUpdate={wizard.updateAccount}
      generateTempId={generateId}
    />
  );
}

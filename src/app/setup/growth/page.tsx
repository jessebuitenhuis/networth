"use client";

import { GrowthStep } from "@/onboarding/components/GrowthStep";
import { useWizard } from "@/onboarding/WizardContext";

export default function GrowthPage() {
  const wizard = useWizard();

  return (
    <GrowthStep
      accounts={wizard.data.accounts}
      onUpdate={wizard.updateAccount}
    />
  );
}

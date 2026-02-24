"use client";

import { useRouter } from "next/navigation";

import { useAccounts } from "@/accounts/AccountContext";
import { useGoals } from "@/goals/GoalContext";
import { generateId } from "@/lib/generateId";
import { useRecurringTransactions } from "@/recurring-transactions/RecurringTransactionContext";
import { useTransactions } from "@/transactions/TransactionContext";

import { SetupStep } from "../SetupStep";
import { setupSteps } from "../setupSteps";
import { submitWizardData } from "../submitWizardData";
import { useWizardState } from "../useWizardState";
import { AccountsStep } from "./AccountsStep";
import { GoalStep } from "./GoalStep";
import { GrowthStep } from "./GrowthStep";
import { IncomeExpensesStep } from "./IncomeExpensesStep";
import { StepLayout } from "./StepLayout";

export function SetupWizard() {
  const router = useRouter();
  const { addAccount } = useAccounts();
  const { addTransaction } = useTransactions();
  const { addRecurringTransaction } = useRecurringTransactions();
  const { addGoal } = useGoals();

  const wizard = useWizardState();
  const stepConfig = setupSteps[wizard.stepIndex];

  async function handleFinish() {
    await submitWizardData(wizard.data, {
      addAccount,
      addTransaction,
      addRecurringTransaction,
      addGoal,
      markSetupCompleted: async () => {
        await fetch("/api/settings/setup-completed", { method: "POST" });
      },
      generateId,
    });
    router.push("/planning");
  }

  function handleNext() {
    if (wizard.isLastStep) {
      handleFinish();
    } else {
      wizard.nextStep();
    }
  }

  return (
    <StepLayout
      config={stepConfig}
      stepIndex={wizard.stepIndex}
      isFirstStep={wizard.isFirstStep}
      isLastStep={wizard.isLastStep}
      onNext={handleNext}
      onBack={wizard.prevStep}
    >
      {wizard.step === SetupStep.Accounts && (
        <AccountsStep
          accounts={wizard.data.accounts}
          onAdd={wizard.addAccount}
          onRemove={wizard.removeAccount}
          onUpdate={wizard.updateAccount}
          generateTempId={generateId}
        />
      )}
      {wizard.step === SetupStep.IncomeExpenses && (
        <IncomeExpensesStep
          entries={wizard.data.recurringEntries}
          accounts={wizard.data.accounts}
          onAdd={wizard.addRecurringEntry}
          onRemove={wizard.removeRecurringEntry}
          onUpdate={wizard.updateRecurringEntry}
          generateTempId={generateId}
        />
      )}
      {wizard.step === SetupStep.Growth && (
        <GrowthStep
          accounts={wizard.data.accounts}
          onUpdate={wizard.updateAccount}
        />
      )}
      {wizard.step === SetupStep.Goals && (
        <GoalStep
          goal={wizard.data.goal}
          onSetGoal={wizard.setGoal}
        />
      )}
    </StepLayout>
  );
}

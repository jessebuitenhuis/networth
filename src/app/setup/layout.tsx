"use client";

import { usePathname, useRouter } from "next/navigation";

import { useAccounts } from "@/accounts/AccountContext";
import { Button } from "@/components/ui/button";
import { useGoals } from "@/goals/GoalContext";
import { generateId } from "@/lib/generateId";
import { StepProgressBar } from "@/onboarding/components/StepProgressBar";
import { setupSteps } from "@/onboarding/setupSteps";
import { submitWizardData } from "@/onboarding/submitWizardData";
import { useWizard, WizardProvider } from "@/onboarding/WizardContext";
import { useRecurringTransactions } from "@/recurring-transactions/RecurringTransactionContext";
import { useTransactions } from "@/transactions/TransactionContext";

function stepIndexFromPathname(pathname: string) {
  const segment = pathname.split("/").pop() ?? "";
  const index = setupSteps.findIndex((s) => s.path === segment);
  return index >= 0 ? index : 0;
}

function SetupShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const wizard = useWizard();
  const { addAccount } = useAccounts();
  const { addTransaction } = useTransactions();
  const { addRecurringTransaction } = useRecurringTransactions();
  const { addGoal } = useGoals();

  const stepIndex = stepIndexFromPathname(pathname);
  const config = setupSteps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === setupSteps.length - 1;

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
    if (isLastStep) {
      handleFinish();
    } else {
      router.push(`/setup/${setupSteps[stepIndex + 1].path}`);
    }
  }

  function handleBack() {
    if (!isFirstStep) {
      router.push(`/setup/${setupSteps[stepIndex - 1].path}`);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-12">
      <div className="mb-8 flex justify-center">
        <StepProgressBar currentIndex={stepIndex} />
      </div>
      <div className="flex-1">
        <h1 className="mb-2 text-2xl font-bold">{config.title}</h1>
        <p className="mb-8 text-muted-foreground">{config.description}</p>
        {children}
      </div>
      <div className="flex justify-between pt-8">
        <Button variant="outline" onClick={handleBack} disabled={isFirstStep}>
          Back
        </Button>
        <Button onClick={handleNext}>{isLastStep ? "Finish" : "Next"}</Button>
      </div>
    </div>
  );
}

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WizardProvider>
      <SetupShell>{children}</SetupShell>
    </WizardProvider>
  );
}

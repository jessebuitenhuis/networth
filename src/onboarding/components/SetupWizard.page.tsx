import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { vi } from "vitest";

import { AccountProvider } from "@/accounts/AccountContext";
import { CategoryProvider } from "@/categories/CategoryContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { GoalProvider } from "@/goals/GoalContext";
import { generateId } from "@/lib/generateId";
import { RecurringTransactionProvider } from "@/recurring-transactions/RecurringTransactionContext";
import { ScenarioProvider } from "@/scenarios/ScenarioContext";
import { TransactionProvider } from "@/transactions/TransactionContext";

import { setupSteps } from "../setupSteps";
import { useWizard, WizardProvider } from "../WizardContext";
import { AccountsStep } from "./AccountsStep";
import { GoalStep } from "./GoalStep";
import { GrowthStep } from "./GrowthStep";
import { IncomeExpensesStep } from "./IncomeExpensesStep";
import { StepProgressBar } from "./StepProgressBar";

function StepContent({ path }: { path: string }) {
  const wizard = useWizard();

  switch (path) {
    case "accounts":
      return (
        <AccountsStep
          accounts={wizard.data.accounts}
          onAdd={wizard.addAccount}
          onRemove={wizard.removeAccount}
          onUpdate={wizard.updateAccount}
          generateTempId={generateId}
        />
      );
    case "income-expenses":
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
    case "growth":
      return (
        <GrowthStep
          accounts={wizard.data.accounts}
          onUpdate={wizard.updateAccount}
        />
      );
    case "goals":
      return (
        <GoalStep goal={wizard.data.goal} onSetGoal={wizard.setGoal} />
      );
  }
}

function TestSetupShell({
  onFinish,
}: {
  onFinish: () => void;
}) {
  const [path, setPath] = useState("accounts");
  const stepIndex = setupSteps.findIndex((s) => s.path === path);
  const config = setupSteps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === setupSteps.length - 1;

  function handleNext() {
    if (isLastStep) {
      onFinish();
    } else {
      setPath(setupSteps[stepIndex + 1].path);
    }
  }

  function handleBack() {
    if (!isFirstStep) {
      setPath(setupSteps[stepIndex - 1].path);
    }
  }

  return (
    <div>
      <StepProgressBar currentIndex={stepIndex} />
      <h1>{config.title}</h1>
      <p>{config.description}</p>
      <StepContent path={path} />
      <button onClick={handleBack} disabled={isFirstStep}>
        Back
      </button>
      <button onClick={handleNext}>{isLastStep ? "Finish" : "Next"}</button>
    </div>
  );
}

export class SetupWizardPage {
  private constructor(
    private _user: ReturnType<typeof userEvent.setup>,
    private _onFinish: ReturnType<typeof vi.fn>,
  ) {}

  static render() {
    const user = userEvent.setup();
    const onFinish = vi.fn();

    render(
      <SidebarProvider>
        <AccountProvider>
          <TransactionProvider>
            <ScenarioProvider>
              <RecurringTransactionProvider>
                <CategoryProvider>
                  <GoalProvider>
                    <WizardProvider>
                      <TestSetupShell onFinish={onFinish} />
                    </WizardProvider>
                  </GoalProvider>
                </CategoryProvider>
              </RecurringTransactionProvider>
            </ScenarioProvider>
          </TransactionProvider>
        </AccountProvider>
      </SidebarProvider>,
    );

    return new SetupWizardPage(user, onFinish);
  }

  get heading() {
    return screen.getByRole("heading", { level: 1 });
  }

  get onFinish() {
    return this._onFinish;
  }

  getButton(name: string | RegExp) {
    return screen.getByRole("button", { name });
  }

  queryButton(name: string | RegExp) {
    return screen.queryByRole("button", { name });
  }

  getText(text: string | RegExp) {
    return screen.getByText(text);
  }

  queryText(text: string | RegExp) {
    return screen.queryByText(text);
  }

  async findText(text: string | RegExp) {
    return screen.findByText(text);
  }

  getNameInput(accountName: string) {
    return screen.getByLabelText(`${accountName} name`);
  }

  getProgressBar() {
    return screen.getByRole("progressbar");
  }

  async clickButton(name: string | RegExp) {
    await this._user.click(this.getButton(name));
    return this;
  }

  async clickSuggestion(name: string) {
    await this._user.click(
      screen.getByRole("button", {
        name: new RegExp(`^[^A-Za-z]+ ${name}$`),
      }),
    );
    return this;
  }

  async type(label: string, text: string) {
    const input = screen.getByLabelText(label);
    await this._user.type(input, text);
    return this;
  }
}

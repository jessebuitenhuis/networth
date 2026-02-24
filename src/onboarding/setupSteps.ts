import { SetupStep } from "./SetupStep";

export type StepConfig = {
  step: SetupStep;
  path: string;
  title: string;
  description: string;
};

export const setupSteps: StepConfig[] = [
  {
    step: SetupStep.Accounts,
    path: "accounts",
    title: "Add your accounts",
    description:
      "Start by adding the accounts you want to track. You can always add more later.",
  },
  {
    step: SetupStep.IncomeExpenses,
    path: "income-expenses",
    title: "Set up recurring income & expenses",
    description:
      "Tell us about your regular cash flows so we can project your future net worth.",
  },
  {
    step: SetupStep.Growth,
    path: "growth",
    title: "Expected growth rates",
    description:
      "Set expected annual return rates for your investment accounts.",
  },
  {
    step: SetupStep.Goals,
    path: "goals",
    title: "Set a goal",
    description:
      "Define a net worth target to track your progress toward.",
  },
];

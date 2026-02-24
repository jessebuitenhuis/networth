import { SetupStep } from "./SetupStep";

export type StepConfig = {
  step: SetupStep;
  title: string;
  description: string;
};

export const setupSteps: StepConfig[] = [
  {
    step: SetupStep.Accounts,
    title: "Add your accounts",
    description:
      "Start by adding the accounts you want to track. You can always add more later.",
  },
  {
    step: SetupStep.IncomeExpenses,
    title: "Set up recurring income & expenses",
    description:
      "Tell us about your regular cash flows so we can project your future net worth.",
  },
  {
    step: SetupStep.Growth,
    title: "Expected growth rates",
    description:
      "Set expected annual return rates for your investment accounts.",
  },
  {
    step: SetupStep.Goals,
    title: "Set a goal",
    description:
      "Define a net worth target to track your progress toward.",
  },
];

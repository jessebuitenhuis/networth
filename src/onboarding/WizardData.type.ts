import type { WizardAccountEntry } from "./WizardAccountEntry.type";
import type { WizardGoalEntry } from "./WizardGoalEntry.type";
import type { WizardRecurringEntry } from "./WizardRecurringEntry.type";

export type WizardData = {
  accounts: WizardAccountEntry[];
  recurringEntries: WizardRecurringEntry[];
  goal: WizardGoalEntry | null;
};

import { useCallback, useState } from "react";

import type { WizardAccountEntry } from "./WizardAccountEntry.type";
import type { WizardData } from "./WizardData.type";
import type { WizardGoalEntry } from "./WizardGoalEntry.type";
import type { WizardRecurringEntry } from "./WizardRecurringEntry.type";

const INITIAL_DATA: WizardData = {
  accounts: [],
  recurringEntries: [],
  goal: null,
};

export function useWizardState() {
  const [data, setData] = useState<WizardData>(INITIAL_DATA);

  const addAccount = useCallback((account: WizardAccountEntry) => {
    setData((d) => ({ ...d, accounts: [...d.accounts, account] }));
  }, []);

  const removeAccount = useCallback((tempId: string) => {
    setData((d) => ({
      ...d,
      accounts: d.accounts.filter((a) => a.tempId !== tempId),
      recurringEntries: d.recurringEntries.filter(
        (r) => r.accountTempId !== tempId,
      ),
    }));
  }, []);

  const updateAccount = useCallback(
    (tempId: string, updates: Partial<WizardAccountEntry>) => {
      setData((d) => ({
        ...d,
        accounts: d.accounts.map((a) =>
          a.tempId === tempId ? { ...a, ...updates } : a,
        ),
      }));
    },
    [],
  );

  const addRecurringEntry = useCallback((entry: WizardRecurringEntry) => {
    setData((d) => ({
      ...d,
      recurringEntries: [...d.recurringEntries, entry],
    }));
  }, []);

  const removeRecurringEntry = useCallback((tempId: string) => {
    setData((d) => ({
      ...d,
      recurringEntries: d.recurringEntries.filter((r) => r.tempId !== tempId),
    }));
  }, []);

  const updateRecurringEntry = useCallback(
    (tempId: string, updates: Partial<WizardRecurringEntry>) => {
      setData((d) => ({
        ...d,
        recurringEntries: d.recurringEntries.map((r) =>
          r.tempId === tempId ? { ...r, ...updates } : r,
        ),
      }));
    },
    [],
  );

  const setGoal = useCallback((goal: WizardGoalEntry | null) => {
    setData((d) => ({ ...d, goal }));
  }, []);

  return {
    data,
    addAccount,
    removeAccount,
    updateAccount,
    addRecurringEntry,
    removeRecurringEntry,
    updateRecurringEntry,
    setGoal,
  };
}

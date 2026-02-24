"use client";

import { createContext, useContext } from "react";

import { useWizardState } from "./useWizardState";

type WizardContextValue = ReturnType<typeof useWizardState>;

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const wizard = useWizardState();
  return (
    <WizardContext.Provider value={wizard}>{children}</WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within WizardProvider");
  return ctx;
}

"use client";

import { useState } from "react";

import { useAccounts } from "@/accounts/AccountContext";
import { AccountPicker } from "@/charts/components/AccountPicker";
import { ProjectedNetWorthChart } from "@/charts/components/ProjectedNetWorthChart";
import TopBar from "@/components/layout/TopBar";
import { generateId } from "@/lib/generateId";
import { useRecurringTransactions } from "@/recurring-transactions/RecurringTransactionContext";
import { CreateScenarioDialog } from "@/scenarios/components/CreateScenarioDialog";
import { DuplicateScenarioDialog } from "@/scenarios/components/DuplicateScenarioDialog";
import { EditScenarioDialog } from "@/scenarios/components/EditScenarioDialog";
import { ScenarioComparisonSummary } from "@/scenarios/components/ScenarioComparisonSummary";
import { ScenarioPicker } from "@/scenarios/components/ScenarioPicker";
import { ScenarioTransactionList } from "@/scenarios/components/ScenarioTransactionList";
import { useScenarios } from "@/scenarios/ScenarioContext";
import { useTransactions } from "@/transactions/TransactionContext";

export default function PlanningPage() {
  const { accounts } = useAccounts();
  const { scenarios, addScenario, setActiveScenario } = useScenarios();
  const { transactions, addTransaction } = useTransactions();
  const { recurringTransactions, addRecurringTransaction } =
    useRecurringTransactions();

  // AGENT: should this and the handleScenarioToggle, handleAccountToggle, etc etc. be handled in two hooks?
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<Set<string>>(new Set());
  const [excludedAccountIds, setExcludedAccountIds] = useState<Set<string>>(new Set());

  function handleScenarioToggle(id: string) {
    setSelectedScenarioIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleAccountToggle(id: string) {
    setExcludedAccountIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleScenarioDelete(id: string) {
    setSelectedScenarioIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function handleClearAllScenarios() {
    setSelectedScenarioIds(new Set());
  }

  function handleCreateScenario(name: string) {
    const scenarioId = generateId();
    addScenario({ id: scenarioId, name });
    setActiveScenario(scenarioId);
    handleScenarioToggle(scenarioId);
  }

  function handleDuplicateScenario(sourceScenarioId: string) {
    return (name: string) => {
      const newScenarioId = generateId();
      const sourceScenario = scenarios.find((s) => s.id === sourceScenarioId);
      addScenario({ id: newScenarioId, name, inflationRate: sourceScenario?.inflationRate });

      transactions
        .filter((t) => t.scenarioId === sourceScenarioId)
        .forEach((t) => {
          addTransaction({ ...t, id: generateId(), scenarioId: newScenarioId });
        });

      recurringTransactions
        .filter((rt) => rt.scenarioId === sourceScenarioId)
        .forEach((rt) => {
          addRecurringTransaction({ ...rt, id: generateId(), scenarioId: newScenarioId });
        });

      setSelectedScenarioIds((prev) => new Set(prev).add(newScenarioId));
    };
  }

  // AGENT: should the ScenarioPicker, EditScenarioDialog and DuplicateScenarioDialog be encapsulated in a component?
  return (
    <>
      <TopBar
        title="Planning"
        actions={
          <>
            <ScenarioPicker
              scenarios={scenarios}
              selectedIds={selectedScenarioIds}
              onToggle={handleScenarioToggle}
              onClearAll={handleClearAllScenarios}
              renderActions={(scenario) => (
                <>
                  <EditScenarioDialog scenario={scenario} onDelete={handleScenarioDelete} />
                  <DuplicateScenarioDialog
                    scenarioName={scenario.name}
                    onSubmit={handleDuplicateScenario(scenario.id)}
                  />
                </>
              )}
            />
            <AccountPicker
              accounts={accounts}
              excludedIds={excludedAccountIds}
              onToggle={handleAccountToggle}
            />
            <CreateScenarioDialog onSubmit={handleCreateScenario} />
          </>
        }
      />
      <div className="p-4 space-y-6">
        <ProjectedNetWorthChart
          selectedScenarioIds={selectedScenarioIds}
          excludedAccountIds={excludedAccountIds}
        />
        <ScenarioComparisonSummary
          selectedScenarioIds={selectedScenarioIds}
          excludedAccountIds={excludedAccountIds}
        />
        <ScenarioTransactionList selectedScenarioIds={selectedScenarioIds} />
      </div>
    </>
  );
}

"use client";

import { useState } from "react";

import { AccountPicker } from "@/components/charts/AccountPicker";
import { ProjectedNetWorthChart } from "@/components/charts/ProjectedNetWorthChart";
import TopBar from "@/components/layout/TopBar";
import { CreateScenarioDialog } from "@/components/scenarios/CreateScenarioDialog";
import { DuplicateScenarioDialog } from "@/components/scenarios/DuplicateScenarioDialog";
import { EditScenarioDialog } from "@/components/scenarios/EditScenarioDialog";
import { ScenarioPicker } from "@/components/scenarios/ScenarioPicker";
import { ScenarioTransactionList } from "@/components/scenarios/ScenarioTransactionList";
import { useAccounts } from "@/accounts/AccountContext";
import { useScenarios } from "@/context/ScenarioContext";

export default function PlanningPage() {
  const { accounts } = useAccounts();
  const { scenarios } = useScenarios();

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

  function handleScenarioDuplicate(newId: string) {
    setSelectedScenarioIds((prev) => new Set(prev).add(newId));
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
                  <DuplicateScenarioDialog scenarioId={scenario.id} onDuplicate={handleScenarioDuplicate} />
                </>
              )}
            />
            <AccountPicker
              accounts={accounts}
              excludedIds={excludedAccountIds}
              onToggle={handleAccountToggle}
            />
            <CreateScenarioDialog onCreate={handleScenarioToggle} />
          </>
        }
      />
      <div className="p-4 space-y-6">
        <ProjectedNetWorthChart
          selectedScenarioIds={selectedScenarioIds}
          excludedAccountIds={excludedAccountIds}
        />
        <ScenarioTransactionList selectedScenarioIds={selectedScenarioIds} />
      </div>
    </>
  );
}

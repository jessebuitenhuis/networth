"use client";

import { useScenarios } from "@/context/ScenarioContext";
import TopBar from "@/components/layout/TopBar";
import { ProjectedNetWorthChart } from "@/components/charts/ProjectedNetWorthChart";
import { ScenarioSelector } from "@/components/scenarios/ScenarioSelector";
import { CreateScenarioDialog } from "@/components/scenarios/CreateScenarioDialog";
import { DuplicateScenarioDialog } from "@/components/scenarios/DuplicateScenarioDialog";
import { EditScenarioDialog } from "@/components/scenarios/EditScenarioDialog";
import { ScenarioTransactionList } from "@/components/scenarios/ScenarioTransactionList";

export default function PlanningPage() {
  const { scenarios, activeScenarioId, setActiveScenario } = useScenarios();
  const activeScenario = scenarios.find((s) => s.id === activeScenarioId);

  return (
    <>
      <TopBar
        title="Planning"
        actions={
          <>
            <ScenarioSelector
              scenarios={scenarios}
              activeScenarioId={activeScenarioId}
              onSelect={setActiveScenario}
            />
            <DuplicateScenarioDialog />
            {activeScenario && <EditScenarioDialog scenario={activeScenario} />}
            <CreateScenarioDialog />
          </>
        }
      />
      <div className="p-4 space-y-6">
        <ProjectedNetWorthChart />
        <ScenarioTransactionList />
      </div>
    </>
  );
}

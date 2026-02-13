"use client";

import { ProjectedNetWorthChart } from "@/components/charts/ProjectedNetWorthChart";
import TopBar from "@/components/layout/TopBar";
import { CreateScenarioDialog } from "@/components/scenarios/CreateScenarioDialog";
import { DuplicateScenarioDialog } from "@/components/scenarios/DuplicateScenarioDialog";
import { EditScenarioDialog } from "@/components/scenarios/EditScenarioDialog";
import { ScenarioSelector } from "@/components/scenarios/ScenarioSelector";
import { ScenarioTransactionList } from "@/components/scenarios/ScenarioTransactionList";
import { useScenarios } from "@/context/ScenarioContext";

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

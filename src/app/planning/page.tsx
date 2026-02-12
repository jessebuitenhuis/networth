"use client";

import { useScenarios } from "@/context/ScenarioContext";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Planning</h1>
        <div className="flex items-center gap-2">
          <ScenarioSelector
            scenarios={scenarios}
            activeScenarioId={activeScenarioId}
            onSelect={setActiveScenario}
          />
          <DuplicateScenarioDialog />
          {activeScenario && <EditScenarioDialog scenario={activeScenario} />}
          <CreateScenarioDialog />
        </div>
      </div>
      <ProjectedNetWorthChart />
      <ScenarioTransactionList />
    </div>
  );
}

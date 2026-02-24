"use client";

import { getScenarioColor } from "@/charts/chartColors";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Goal } from "@/goals/Goal.type";
import type { Scenario } from "@/scenarios/Scenario.type";

import { GoalAchievementRows } from "./GoalAchievementRows";
import { IncomeExpenseRows } from "./IncomeExpenseRows";
import { NetWorthRows } from "./NetWorthRows";
import { useScenarioMetricsColumns } from "./useScenarioMetricsColumns";

type ScenarioComparisonSummaryProps = {
  selectedScenarioIds: Set<string>;
  excludedAccountIds: Set<string>;
  scenarios: Scenario[];
  goals: Goal[];
};

export function ScenarioComparisonSummary({
  selectedScenarioIds,
  excludedAccountIds,
  scenarios,
  goals,
}: ScenarioComparisonSummaryProps) {
  const metricsColumns = useScenarioMetricsColumns(
    selectedScenarioIds,
    excludedAccountIds
  );

  if (!metricsColumns) return null;

  const scenarioIndexMap = new Map(scenarios.map((s, i) => [s.id, i]));

  return (
    <div className="surface-section space-y-4 p-6">
      <h2 className="section-label">Scenario Comparison</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[160px]">Metric</TableHead>
            {metricsColumns.map((col) => (
              <TableHead
                key={col.scenarioId ?? "baseline"}
                className="text-right min-w-[120px]"
                style={
                  col.scenarioId
                    ? { color: getScenarioColor(scenarioIndexMap.get(col.scenarioId) ?? 0) }
                    : undefined
                }
              >
                {col.scenarioName}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <NetWorthRows columns={metricsColumns} />
          {goals.length > 0 && (
            <GoalAchievementRows columns={metricsColumns} goals={goals} />
          )}
          <IncomeExpenseRows columns={metricsColumns} />
        </TableBody>
      </Table>
    </div>
  );
}

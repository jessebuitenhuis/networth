"use client";

import { getScenarioColor } from "@/charts/chartColors";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGoals } from "@/goals/GoalContext";
import { useScenarios } from "@/scenarios/ScenarioContext";

import { GoalAchievementRows } from "./GoalAchievementRows";
import { IncomeExpenseRows } from "./IncomeExpenseRows";
import { NetWorthRows } from "./NetWorthRows";
import { useScenarioMetricsColumns } from "./useScenarioMetricsColumns";

export function ScenarioComparisonSummary({
  selectedScenarioIds,
  excludedAccountIds,
}: {
  selectedScenarioIds: Set<string>;
  excludedAccountIds: Set<string>;
}) {
  const { scenarios } = useScenarios();
  const { goals } = useGoals();
  const metricsColumns = useScenarioMetricsColumns(
    selectedScenarioIds,
    excludedAccountIds
  );

  if (!metricsColumns) return null;

  const scenarioIndexMap = new Map(scenarios.map((s, i) => [s.id, i]));

  return (
    <div className="rounded-lg border p-6 space-y-4">
      <h2 className="text-sm font-medium text-muted-foreground">
        Scenario Comparison
      </h2>
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

"use client";

import { getScenarioColor } from "@/charts/chartColors";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGoals } from "@/goals/GoalContext";
import { formatCurrency } from "@/lib/formatCurrency";
import { useScenarios } from "@/scenarios/ScenarioContext";

import { formatAchievementDate } from "./formatAchievementDate";
import { useScenarioMetricsColumns } from "./useScenarioMetricsColumns";

const NET_WORTH_ROWS = [
  { label: "1 Year", key: "projectedNetWorth1yr" as const },
  { label: "5 Years", key: "projectedNetWorth5yr" as const },
  { label: "10 Years", key: "projectedNetWorth10yr" as const },
];

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
  const hasGoals = goals.length > 0;

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
          <TableRow>
            <TableCell
              colSpan={metricsColumns.length + 1}
              className="font-semibold text-xs text-muted-foreground uppercase tracking-wide bg-muted/30 py-1.5"
            >
              Projected Net Worth
            </TableCell>
          </TableRow>
          {NET_WORTH_ROWS.map((row) => (
            <TableRow key={row.key}>
              <TableCell className="text-muted-foreground">
                {row.label}
              </TableCell>
              {metricsColumns.map((col) => (
                <TableCell
                  key={col.scenarioId ?? "baseline"}
                  className="text-right font-medium"
                >
                  {formatCurrency(col[row.key])}
                </TableCell>
              ))}
            </TableRow>
          ))}

          {hasGoals && (
            <>
              <TableRow>
                <TableCell
                  colSpan={metricsColumns.length + 1}
                  className="font-semibold text-xs text-muted-foreground uppercase tracking-wide bg-muted/30 py-1.5"
                >
                  Goal Achievement
                </TableCell>
              </TableRow>
              {goals.map((goal) => (
                <TableRow key={goal.id}>
                  <TableCell className="text-muted-foreground">
                    {goal.name}
                  </TableCell>
                  {metricsColumns.map((col) => {
                    const achievement = col.goalAchievements.find(
                      (ga) => ga.goalId === goal.id
                    );
                    return (
                      <TableCell
                        key={col.scenarioId ?? "baseline"}
                        className="text-right font-medium"
                      >
                        {formatAchievementDate(
                          achievement?.achievementDate ?? null
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </>
          )}

          <TableRow>
            <TableCell
              colSpan={metricsColumns.length + 1}
              className="font-semibold text-xs text-muted-foreground uppercase tracking-wide bg-muted/30 py-1.5"
            >
              Income vs Expenses (10yr)
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="text-muted-foreground">
              Total Income
            </TableCell>
            {metricsColumns.map((col) => (
              <TableCell
                key={col.scenarioId ?? "baseline"}
                className="text-right font-medium text-emerald-600"
              >
                {formatCurrency(col.totalIncome)}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="text-muted-foreground">
              Total Expenses
            </TableCell>
            {metricsColumns.map((col) => (
              <TableCell
                key={col.scenarioId ?? "baseline"}
                className="text-right font-medium text-red-500"
              >
                {formatCurrency(col.totalExpenses)}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="text-muted-foreground">Net</TableCell>
            {metricsColumns.map((col) => {
              const net = col.totalIncome - col.totalExpenses;
              return (
                <TableCell
                  key={col.scenarioId ?? "baseline"}
                  className={`text-right font-semibold ${net >= 0 ? "text-emerald-600" : "text-red-500"}`}
                >
                  {formatCurrency(net)}
                </TableCell>
              );
            })}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

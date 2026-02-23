"use client";

import { useState } from "react";
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useAccounts } from "@/accounts/AccountContext";
import { getGoalColor, getScenarioColor } from "@/charts/chartColors";
import { formatChartCurrency as formatCurrency } from "@/charts/chartFormatters";
import { ChartPeriod } from "@/charts/ChartPeriod";
import { computeProjectedSeries } from "@/charts/computeProjectedSeries";
import { computeYAxisConfig } from "@/charts/computeYAxisConfig";
import type { DateRange } from "@/charts/DateRange.type";
import { formatTick, getTickFormat } from "@/charts/formatXAxisTick";
import { mergeProjectedSeries } from "@/charts/mergeProjectedSeries";
import { useGoals } from "@/goals/GoalContext";
import { addMonths, formatDate } from "@/lib/dateUtils";
import { useRecurringTransactions } from "@/recurring-transactions/RecurringTransactionContext";
import { useScenarios } from "@/scenarios/ScenarioContext";
import { useTransactions } from "@/transactions/TransactionContext";

import { CustomDateRangePicker } from "./CustomDateRangePicker";
import { PeriodPicker } from "./PeriodPicker";
import { ScenarioLegend } from "./ScenarioLegend";

const PROJECTED_PERIODS = [
  ChartPeriod.OneWeek,
  ChartPeriod.OneMonth,
  ChartPeriod.ThreeMonths,
  ChartPeriod.SixMonths,
  ChartPeriod.OneYear,
  ChartPeriod.All,
  ChartPeriod.Custom,
];

type ProjectedNetWorthChartProps = {
  selectedScenarioIds: Set<string>;
  excludedAccountIds: Set<string>;
};

export function ProjectedNetWorthChart({
  selectedScenarioIds,
  excludedAccountIds,
}: ProjectedNetWorthChartProps) {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const { recurringTransactions } = useRecurringTransactions();
  const { scenarios } = useScenarios();
  const { goals } = useGoals();
  const [period, setPeriod] = useState(ChartPeriod.OneMonth);

  const today = formatDate(new Date());
  const defaultEnd = formatDate(addMonths(new Date(), 3));
  const [customRange, setCustomRange] = useState<DateRange>({ start: today, end: defaultEnd });
  const chartKey = `${period}-${customRange.start}-${customRange.end}-${Array.from(selectedScenarioIds).join(",")}`;

  const filteredAccounts = accounts.filter((a) => !excludedAccountIds.has(a.id));

  const seriesMap = new Map<string, ReturnType<typeof computeProjectedSeries>>();

  const baselineTransactions = transactions.filter((t) => !t.scenarioId);
  const baselineRecurringTransactions = recurringTransactions.filter(
    (rt) => !rt.scenarioId
  );
  const baselineSeries = computeProjectedSeries(
    filteredAccounts,
    baselineTransactions,
    period,
    today,
    period === ChartPeriod.Custom ? customRange : undefined,
    baselineRecurringTransactions
  );
  seriesMap.set("baseline", baselineSeries);

  for (const scenarioId of selectedScenarioIds) {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    const scenarioTransactions = transactions.filter(
      (t) => !t.scenarioId || t.scenarioId === scenarioId
    );
    const scenarioRecurringTransactions = recurringTransactions.filter(
      (rt) => !rt.scenarioId || rt.scenarioId === scenarioId
    );
    const scenarioSeries = computeProjectedSeries(
      filteredAccounts,
      scenarioTransactions,
      period,
      today,
      period === ChartPeriod.Custom ? customRange : undefined,
      scenarioRecurringTransactions,
      scenario?.inflationRate ?? 0
    );
    seriesMap.set(`scenario_${scenarioId}`, scenarioSeries);
  }

  const data = mergeProjectedSeries(seriesMap);
  const tickFormat = getTickFormat(period, baselineSeries);

  // Calculate Y-axis domain to include goal target amounts
  const maxGoalAmount = goals.length > 0 ? Math.max(...goals.map((g) => g.targetAmount)) : 0;
  const allNumericValues = data.flatMap((point) => Object.values(point).filter((v): v is number => typeof v === "number"));
  const maxDataValue = allNumericValues.length > 0 ? Math.max(...allNumericValues) : 0;
  const minDataValue = allNumericValues.length > 0 ? Math.min(...allNumericValues) : 0;
  const yAxisConfig = computeYAxisConfig(minDataValue, Math.max(maxDataValue, maxGoalAmount));

  // Build legend entries
  const legendEntries = [
    { name: "Baseline", color: "var(--color-primary)", lineStyle: "solid" as const },
    ...Array.from(selectedScenarioIds).map((scenarioId) => {
      const scenario = scenarios.find((s) => s.id === scenarioId);
      const scenarioIndex = scenarios.findIndex((s) => s.id === scenarioId);
      return {
        name: scenario?.name || scenarioId,
        color: getScenarioColor(scenarioIndex),
        lineStyle: "dashed" as const,
      };
    }),
    ...goals.map((goal, i) => ({
      name: goal.name,
      color: getGoalColor(i),
      lineStyle: "dotted" as const,
    })),
  ];

  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          Projected Net Worth
        </h2>
        <PeriodPicker
          periods={PROJECTED_PERIODS}
          selected={period}
          onSelect={setPeriod}
        />
      </div>
      {period === ChartPeriod.Custom && (
        <CustomDateRangePicker
          start={customRange.start}
          end={customRange.end}
          onChange={setCustomRange}
        />
      )}
      <div data-testid="projected-chart">
        <ResponsiveContainer width="100%" height={256}>
          <LineChart key={chartKey} data={data}>
            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatTick(v, tickFormat)}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={yAxisConfig.domain}
              ticks={yAxisConfig.ticks}
              tickFormatter={formatCurrency}
              tick={{ fontSize: 12 }}
              width={80}
            />
            <ReferenceLine y={0} stroke="var(--color-border)" strokeWidth={1} />
            <Tooltip
              labelFormatter={(v) => formatTick(v as string, tickFormat)}
              formatter={(value) => formatCurrency(value as number)}
            />
            <Line
              type="monotone"
              dataKey="baseline"
              name="Baseline"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              animationDuration={300}
            />
            {Array.from(selectedScenarioIds).map((scenarioId) => {
              const scenario = scenarios.find((s) => s.id === scenarioId);
              const scenarioIndex = scenarios.findIndex((s) => s.id === scenarioId);
              return (
                <Line
                  key={scenarioId}
                  type="monotone"
                  dataKey={`scenario_${scenarioId}`}
                  name={scenario?.name || scenarioId}
                  stroke={getScenarioColor(scenarioIndex)}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  isAnimationActive={true}
                  animationDuration={300}
                />
              );
            })}
            {goals.map((goal, i) => (
              <ReferenceLine
                key={goal.id}
                y={goal.targetAmount}
                stroke={getGoalColor(i)}
                strokeDasharray="2 4"
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ScenarioLegend entries={legendEntries} />
    </div>
  );
}

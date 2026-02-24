"use client";

import { useCallback, useState } from "react";
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
import type { DateRange } from "@/charts/DateRange.type";
import { formatTick } from "@/charts/formatXAxisTick";
import { useProjectedChartData } from "@/charts/useProjectedChartData";
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
  const [offset, setOffset] = useState(0);

  const today = formatDate(new Date());
  const defaultEnd = formatDate(addMonths(new Date(), 3));
  const [customRange, setCustomRange] = useState<DateRange>({ start: today, end: defaultEnd });

  const handlePeriodSelect = useCallback((newPeriod: ChartPeriod) => {
    setPeriod(newPeriod);
    setOffset(0);
  }, []);
  const handlePrevious = useCallback(() => setOffset((o) => o - 1), []);
  const handleNext = useCallback(() => setOffset((o) => o + 1), []);

  const filteredAccounts = accounts.filter((a) => !excludedAccountIds.has(a.id));

  const { data, tickFormat, hasTodayLine, isNavigable, yAxisConfig, legendEntries } =
    useProjectedChartData({
      accounts: filteredAccounts,
      transactions,
      recurringTransactions,
      scenarios,
      goals,
      selectedScenarioIds,
      period,
      offset,
      today,
      customRange,
    });

  const chartKey = `${period}-${offset}-${customRange.start}-${customRange.end}-${Array.from(selectedScenarioIds).join(",")}`;

  return (
    <div className="surface-section space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="section-label">Projected Net Worth</h2>
        <PeriodPicker
          periods={PROJECTED_PERIODS}
          selected={period}
          onSelect={handlePeriodSelect}
          onPrevious={isNavigable ? handlePrevious : undefined}
          onNext={isNavigable ? handleNext : undefined}
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
        <ResponsiveContainer width="100%" height={280}>
          <LineChart key={chartKey} data={data}>
            <defs>
              <linearGradient id="projectedLineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="oklch(0.72 0.17 162)" />
                <stop offset="100%" stopColor="oklch(0.78 0.13 75)" />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatTick(v, tickFormat)}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              domain={yAxisConfig.domain}
              ticks={yAxisConfig.ticks}
              tickFormatter={formatCurrency}
              tick={{ fontSize: 11 }}
              width={80}
            />
            <ReferenceLine y={0} stroke="var(--color-border)" strokeWidth={1} strokeDasharray="4 4" />
            <Tooltip
              labelFormatter={(v) => formatTick(v as string, tickFormat)}
              formatter={(value) => formatCurrency(value as number)}
            />
            <Line
              type="monotone"
              dataKey="baseline"
              name="Baseline"
              stroke="url(#projectedLineGradient)"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={true}
              animationDuration={600}
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
            {hasTodayLine && (
              <ReferenceLine
                x={today}
                stroke="var(--color-muted-foreground)"
                strokeDasharray="4 4"
                strokeWidth={1}
                label={{ value: "Today", position: "top", fontSize: 11 }}
              />
            )}
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

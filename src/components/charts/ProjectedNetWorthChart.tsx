"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useAccounts } from "@/context/AccountContext";
import { useTransactions } from "@/context/TransactionContext";
import { useRecurringTransactions } from "@/context/RecurringTransactionContext";
import { useScenarios } from "@/context/ScenarioContext";
import { ChartPeriod } from "@/models/ChartPeriod";
import type { DateRange } from "@/models/DateRange.type";
import { computeProjectedSeries } from "@/services/computeProjectedSeries";
import { mergeProjectedSeries } from "@/services/mergeProjectedSeries";
import { addMonths, formatDate } from "@/lib/dateUtils";
import { formatTick, getTickFormat } from "@/lib/formatXAxisTick";
import { formatCurrency } from "./NetWorthChart";
import { getScenarioColor } from "@/lib/chartColors";
import { ChartLegend } from "./ChartLegend";
import { PeriodPicker } from "./PeriodPicker";
import { CustomDateRangePicker } from "./CustomDateRangePicker";
import { ScenarioChartPicker } from "./ScenarioChartPicker";

const PROJECTED_PERIODS = [
  ChartPeriod.OneWeek,
  ChartPeriod.OneMonth,
  ChartPeriod.ThreeMonths,
  ChartPeriod.SixMonths,
  ChartPeriod.OneYear,
  ChartPeriod.All,
  ChartPeriod.Custom,
];

export function ProjectedNetWorthChart() {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const { recurringTransactions } = useRecurringTransactions();
  const { scenarios } = useScenarios();
  const [period, setPeriod] = useState(ChartPeriod.OneMonth);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
  const [selectedScenarioIds, setSelectedScenarioIds] = useState<Set<string>>(
    new Set()
  );

  const today = formatDate(new Date());
  const defaultEnd = formatDate(addMonths(new Date(), 3));
  const [customRange, setCustomRange] = useState<DateRange>({ start: today, end: defaultEnd });
  const chartKey = `${period}-${customRange.start}-${customRange.end}-${Array.from(selectedScenarioIds).join(",")}`;

  function handleToggle(id: string) {
    setExcludedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleScenarioToggle(scenarioId: string) {
    setSelectedScenarioIds((prev) => {
      const next = new Set(prev);
      if (next.has(scenarioId)) next.delete(scenarioId);
      else next.add(scenarioId);
      return next;
    });
  }

  const filteredAccounts = accounts.filter((a) => !excludedIds.has(a.id));

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
      scenarioRecurringTransactions
    );
    seriesMap.set(`scenario_${scenarioId}`, scenarioSeries);
  }

  const data = mergeProjectedSeries(seriesMap);
  const tickFormat = getTickFormat(period, baselineSeries);

  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          Projected Net Worth
        </h2>
        <div className="flex items-center gap-2">
          <ScenarioChartPicker
            scenarios={scenarios}
            selectedIds={selectedScenarioIds}
            onToggle={handleScenarioToggle}
          />
          <PeriodPicker
            periods={PROJECTED_PERIODS}
            selected={period}
            onSelect={setPeriod}
          />
        </div>
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
              tickFormatter={formatCurrency}
              tick={{ fontSize: 12 }}
              width={80}
            />
            <Tooltip
              labelFormatter={(v) => formatTick(v as string, tickFormat)}
              formatter={(value) => formatCurrency(value as number)}
            />
            <Legend />
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
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ChartLegend
        accounts={accounts}
        excludedIds={excludedIds}
        onToggle={handleToggle}
      />
    </div>
  );
}

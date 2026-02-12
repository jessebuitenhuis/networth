"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAccounts } from "@/context/AccountContext";
import { useTransactions } from "@/context/TransactionContext";
import { useRecurringTransactions } from "@/context/RecurringTransactionContext";
import { useScenarios } from "@/context/ScenarioContext";
import { ChartPeriod } from "@/models/ChartPeriod";
import type { DateRange } from "@/models/DateRange.type";
import { computeProjectedSeries } from "@/services/computeProjectedSeries";
import { addMonths, formatDate } from "@/lib/dateUtils";
import { formatTick, getTickFormat } from "@/lib/formatXAxisTick";
import { formatCurrency } from "./NetWorthChart";
import { ChartLegend } from "./ChartLegend";
import { PeriodPicker } from "./PeriodPicker";
import { CustomDateRangePicker } from "./CustomDateRangePicker";

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
  const { activeScenarioId } = useScenarios();
  const [period, setPeriod] = useState(ChartPeriod.OneMonth);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());

  const today = formatDate(new Date());
  const defaultEnd = formatDate(addMonths(new Date(), 3));
  const [customRange, setCustomRange] = useState<DateRange>({ start: today, end: defaultEnd });
  const chartKey = `${period}-${customRange.start}-${customRange.end}`;

  function handleToggle(id: string) {
    setExcludedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filteredAccounts = accounts.filter((a) => !excludedIds.has(a.id));

  // Filter by scenario:
  // - If activeScenarioId is null (baseline only): show only items with no scenarioId
  // - If activeScenarioId is set: show baseline (no scenarioId) + matching scenario items
  const filteredRecurringTransactions = recurringTransactions.filter((rt) => {
    if (activeScenarioId === null) {
      return !rt.scenarioId;
    }
    return !rt.scenarioId || rt.scenarioId === activeScenarioId;
  });

  const filteredTransactions = transactions.filter((t) => {
    if (activeScenarioId === null) {
      return !t.scenarioId;
    }
    return !t.scenarioId || t.scenarioId === activeScenarioId;
  });

  const data = computeProjectedSeries(
    filteredAccounts,
    filteredTransactions,
    period,
    today,
    period === ChartPeriod.Custom ? customRange : undefined,
    filteredRecurringTransactions
  );
  const tickFormat = getTickFormat(period, data);

  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          Projected Net Worth
        </h2>
        <PeriodPicker periods={PROJECTED_PERIODS} selected={period} onSelect={setPeriod} />
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
            <XAxis dataKey="date" tickFormatter={(v) => formatTick(v, tickFormat)} tick={{ fontSize: 12 }} />
            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fontSize: 12 }}
              width={80}
            />
            <Tooltip
              labelFormatter={(v) => formatTick(v as string, tickFormat)}
              formatter={(value) => formatCurrency(value as number)}
            />
            <Line
              type="monotone"
              dataKey="netWorth"
              stroke="var(--color-primary)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive={true}
              animationDuration={300}
            />
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

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
import { ProjectionPeriod } from "@/models/ProjectionPeriod";
import { computeProjectedSeries } from "@/services/computeProjectedSeries";
import { formatDate } from "@/lib/dateUtils";
import { addMonths } from "@/lib/dateUtils";
import { formatCurrency } from "./NetWorthChart";
import { ChartLegend } from "./ChartLegend";
import { ProjectionPeriodPicker } from "./ProjectionPeriodPicker";
import { CustomDateRangePicker } from "./CustomDateRangePicker";

export function ProjectedNetWorthChart() {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const { recurringTransactions } = useRecurringTransactions();
  const { scenarios, activeScenarioId } = useScenarios();
  const [period, setPeriod] = useState(ProjectionPeriod.ThreeMonths);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());

  const today = formatDate(new Date());
  const defaultEnd = formatDate(addMonths(new Date(), 3));
  const [customRange, setCustomRange] = useState({ start: today, end: defaultEnd });

  function handleToggle(id: string) {
    setExcludedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filteredAccounts = accounts.filter((a) => !excludedIds.has(a.id));

  const defaultScenarioId = scenarios[0]?.id;
  const filteredRecurringTransactions = recurringTransactions.filter(
    (rt) =>
      rt.scenarioId === activeScenarioId ||
      (!rt.scenarioId && activeScenarioId === defaultScenarioId)
  );

  const filteredProjectedTransactions = transactions.filter(
    (t) =>
      !t.isProjected ||
      t.scenarioId === activeScenarioId ||
      (!t.scenarioId && activeScenarioId === defaultScenarioId)
  );

  const data = computeProjectedSeries(
    filteredAccounts,
    filteredProjectedTransactions,
    period,
    today,
    period === ProjectionPeriod.Custom ? customRange : undefined,
    filteredRecurringTransactions
  );

  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">
          Projected Net Worth
        </h2>
        <ProjectionPeriodPicker selected={period} onSelect={setPeriod} />
      </div>
      {period === ProjectionPeriod.Custom && (
        <CustomDateRangePicker
          start={customRange.start}
          end={customRange.end}
          onChange={setCustomRange}
        />
      )}
      <div data-testid="projected-chart" className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fontSize: 12 }}
              width={80}
            />
            <Tooltip
              formatter={(value) => formatCurrency(value as number)}
            />
            <Line
              type="monotone"
              dataKey="netWorth"
              stroke="var(--color-primary)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
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

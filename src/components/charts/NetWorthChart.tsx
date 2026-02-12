"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAccounts } from "@/context/AccountContext";
import { useTransactions } from "@/context/TransactionContext";
import { ChartPeriod } from "@/models/ChartPeriod";
import type { DateRange } from "@/models/DateRange";
import { computeNetWorthSeries } from "@/services/computeNetWorthSeries";
import { addMonths, formatDate } from "@/lib/dateUtils";
import { formatTick, getTickFormat } from "@/lib/formatXAxisTick";
import { ChartLegend } from "./ChartLegend";
import { CustomDateRangePicker } from "./CustomDateRangePicker";
import { PeriodPicker } from "./PeriodPicker";
import { getDefaultCurrency } from "@/lib/getLocale";

const HISTORICAL_PERIODS = [
  ChartPeriod.OneWeek,
  ChartPeriod.MTD,
  ChartPeriod.OneMonth,
  ChartPeriod.ThreeMonths,
  ChartPeriod.SixMonths,
  ChartPeriod.YTD,
  ChartPeriod.OneYear,
  ChartPeriod.All,
  ChartPeriod.Custom,
];

export function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, { style: "currency", currency: getDefaultCurrency(), maximumFractionDigits: 0 });
}

export function NetWorthChart() {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const [period, setPeriod] = useState(ChartPeriod.OneMonth);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
  const today = formatDate(new Date());
  const defaultEnd = formatDate(addMonths(new Date(), -1));
  const [customRange, setCustomRange] = useState<DateRange>({ start: defaultEnd, end: today });
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
  const data = computeNetWorthSeries(
    filteredAccounts,
    transactions,
    period,
    undefined,
    period === ChartPeriod.Custom ? customRange : undefined
  );
  const tickFormat = getTickFormat(period, data);

  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Net Worth Over Time</h2>
        <PeriodPicker periods={HISTORICAL_PERIODS} selected={period} onSelect={setPeriod} />
      </div>
      {period === ChartPeriod.Custom && (
        <CustomDateRangePicker
          start={customRange.start}
          end={customRange.end}
          onChange={setCustomRange}
        />
      )}
      <div data-testid="net-worth-chart">
        <ResponsiveContainer width="100%" height={256}>
          <LineChart key={chartKey} data={data}>
            <XAxis dataKey="date" tickFormatter={(v) => formatTick(v, tickFormat)} tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} width={80} />
            <Tooltip
              labelFormatter={(v) => formatTick(v as string, tickFormat)}
              formatter={(value) => formatCurrency(value as number)}
            />
            <Line
              type="monotone"
              dataKey="netWorth"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={true}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ChartLegend accounts={accounts} excludedIds={excludedIds} onToggle={handleToggle} />
    </div>
  );
}

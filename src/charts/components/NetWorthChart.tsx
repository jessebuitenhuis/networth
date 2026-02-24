"use client";

import { useCallback, useState } from "react";
import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useAccounts } from "@/accounts/AccountContext";
import {
  formatTooltipLabel,
  formatTooltipValue,
  formatXAxisTick,
  formatYAxisValue,
} from "@/charts/chartFormatters";
import { ChartPeriod } from "@/charts/ChartPeriod";
import { computeNetWorthSeries } from "@/charts/computeNetWorthSeries";
import { computeYAxisConfig } from "@/charts/computeYAxisConfig";
import type { DateRange } from "@/charts/DateRange.type";
import { getTickFormat } from "@/charts/formatXAxisTick";
import { addMonths, formatDate } from "@/lib/dateUtils";
import { useTransactions } from "@/transactions/TransactionContext";

import { ChartLegend } from "./ChartLegend";
import { CustomDateRangePicker } from "./CustomDateRangePicker";
import { PeriodPicker } from "./PeriodPicker";

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
  const netWorthValues = data.map((p) => p.netWorth);
  const minValue = netWorthValues.length > 0 ? Math.min(...netWorthValues) : 0;
  const maxValue = netWorthValues.length > 0 ? Math.max(...netWorthValues) : 0;
  const yAxisConfig = computeYAxisConfig(minValue, maxValue);
  const tickFormat = getTickFormat(period, data);

  const xAxisFormatter = useCallback((v: string) => formatXAxisTick(v, tickFormat), [tickFormat]);
  const tooltipLabelFormatter = useCallback((label: unknown) => formatTooltipLabel(String(label), tickFormat), [tickFormat]);
  const tooltipValueFormatter = useCallback((value: unknown) => formatTooltipValue(Number(value)), []);

  return (
    <div className="surface-section space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="section-label">Net Worth Over Time</h2>
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
        <ResponsiveContainer width="100%" height={280}>
          <LineChart key={chartKey} data={data}>
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="oklch(0.72 0.17 162)" />
                <stop offset="100%" stopColor="oklch(0.78 0.13 75)" />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tickFormatter={xAxisFormatter} tick={{ fontSize: 11 }} />
            <YAxis
              domain={yAxisConfig.domain}
              ticks={yAxisConfig.ticks}
              tickFormatter={formatYAxisValue}
              tick={{ fontSize: 11 }}
              width={80}
            />
            <Tooltip
              labelFormatter={tooltipLabelFormatter}
              formatter={tooltipValueFormatter}
            />
            <ReferenceLine y={0} stroke="var(--color-border)" strokeWidth={1} strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="netWorth"
              stroke="url(#lineGradient)"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={true}
              animationDuration={600}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ChartLegend accounts={accounts} excludedIds={excludedIds} onToggle={handleToggle} />
    </div>
  );
}

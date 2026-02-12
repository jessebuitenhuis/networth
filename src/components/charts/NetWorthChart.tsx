"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAccounts } from "@/context/AccountContext";
import { useTransactions } from "@/context/TransactionContext";
import { ChartPeriod } from "@/models/ChartPeriod";
import { computeNetWorthSeries } from "@/services/computeNetWorthSeries";
import { ChartLegend } from "./ChartLegend";
import { PeriodPicker } from "./PeriodPicker";
import { getDefaultCurrency } from "@/lib/getLocale";

export function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, { style: "currency", currency: getDefaultCurrency(), maximumFractionDigits: 0 });
}

export function NetWorthChart() {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const [period, setPeriod] = useState(ChartPeriod.Month);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());

  function handleToggle(id: string) {
    setExcludedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filteredAccounts = accounts.filter((a) => !excludedIds.has(a.id));
  const data = computeNetWorthSeries(filteredAccounts, transactions, period);

  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Net Worth Over Time</h2>
        <PeriodPicker selected={period} onSelect={setPeriod} />
      </div>
      <div data-testid="net-worth-chart">
        <ResponsiveContainer width="100%" height={256}>
          <LineChart data={data}>
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} width={80} />
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Line
              type="monotone"
              dataKey="netWorth"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ChartLegend accounts={accounts} excludedIds={excludedIds} onToggle={handleToggle} />
    </div>
  );
}

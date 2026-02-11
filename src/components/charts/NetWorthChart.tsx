"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAccounts } from "@/context/AccountContext";
import { useTransactions } from "@/context/TransactionContext";
import { ChartPeriod } from "@/models/ChartPeriod";
import { computeNetWorthSeries } from "@/services/computeNetWorthSeries";
import { PeriodPicker } from "./PeriodPicker";

export function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function NetWorthChart() {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const [period, setPeriod] = useState(ChartPeriod.Month);

  const data = computeNetWorthSeries(accounts, transactions, period);

  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Net Worth Over Time</h2>
        <PeriodPicker selected={period} onSelect={setPeriod} />
      </div>
      <div data-testid="net-worth-chart" className="h-64">
        <ResponsiveContainer width="100%" height="100%">
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
    </div>
  );
}

import { formatCurrency } from "@/lib/formatCurrency";
import type { ScenarioComparisonMetrics } from "@/scenarios/ScenarioComparisonMetrics.type";

import { ComparisonRow } from "./ComparisonRow";
import { ComparisonSectionHeader } from "./ComparisonSectionHeader";

function netValueClassName(col: ScenarioComparisonMetrics): string {
  const net = col.totalIncome - col.totalExpenses;
  return `font-semibold ${net >= 0 ? "text-emerald-600" : "text-red-500"}`;
}

export function IncomeExpenseRows({
  columns,
}: {
  columns: ScenarioComparisonMetrics[];
}) {
  return (
    <>
      <ComparisonSectionHeader
        label="Income vs Expenses (10yr)"
        columnCount={columns.length}
      />
      <ComparisonRow
        label="Total Income"
        columns={columns}
        renderValue={(col) => formatCurrency(col.totalIncome)}
        valueClassName="font-medium text-emerald-600"
      />
      <ComparisonRow
        label="Total Expenses"
        columns={columns}
        renderValue={(col) => formatCurrency(col.totalExpenses)}
        valueClassName="font-medium text-red-500"
      />
      <ComparisonRow
        label="Net"
        columns={columns}
        renderValue={(col) =>
          formatCurrency(col.totalIncome - col.totalExpenses)
        }
        valueClassName={netValueClassName}
      />
    </>
  );
}

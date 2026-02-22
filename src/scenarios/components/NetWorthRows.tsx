import { formatCurrency } from "@/lib/formatCurrency";
import type { ScenarioComparisonMetrics } from "@/scenarios/ScenarioComparisonMetrics.type";

import { ComparisonRow } from "./ComparisonRow";
import { ComparisonSectionHeader } from "./ComparisonSectionHeader";

const NET_WORTH_ROWS = [
  { label: "1 Year", key: "projectedNetWorth1yr" as const },
  { label: "5 Years", key: "projectedNetWorth5yr" as const },
  { label: "10 Years", key: "projectedNetWorth10yr" as const },
];

export function NetWorthRows({
  columns,
}: {
  columns: ScenarioComparisonMetrics[];
}) {
  return (
    <>
      <ComparisonSectionHeader
        label="Projected Net Worth"
        columnCount={columns.length}
      />
      {NET_WORTH_ROWS.map((row) => (
        <ComparisonRow
          key={row.key}
          label={row.label}
          columns={columns}
          renderValue={(col) => formatCurrency(col[row.key])}
        />
      ))}
    </>
  );
}

import type { ReactNode } from "react";

import { TableCell, TableRow } from "@/components/ui/table";
import type { ScenarioComparisonMetrics } from "@/scenarios/ScenarioComparisonMetrics.type";

export function ComparisonRow({
  label,
  columns,
  renderValue,
  valueClassName = "font-medium",
}: {
  label: string;
  columns: ScenarioComparisonMetrics[];
  renderValue: (col: ScenarioComparisonMetrics) => ReactNode;
  valueClassName?:
    | string
    | ((col: ScenarioComparisonMetrics) => string);
}) {
  return (
    <TableRow>
      <TableCell className="text-muted-foreground">{label}</TableCell>
      {columns.map((col) => (
        <TableCell
          key={col.scenarioId ?? "baseline"}
          className={`text-right ${typeof valueClassName === "function" ? valueClassName(col) : valueClassName}`}
        >
          {renderValue(col)}
        </TableCell>
      ))}
    </TableRow>
  );
}

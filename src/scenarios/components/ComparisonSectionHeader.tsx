import { TableCell, TableRow } from "@/components/ui/table";

export function ComparisonSectionHeader({
  label,
  columnCount,
}: {
  label: string;
  columnCount: number;
}) {
  return (
    <TableRow>
      <TableCell
        colSpan={columnCount + 1}
        className="font-semibold text-xs text-muted-foreground uppercase tracking-wide bg-muted/30 py-1.5"
      >
        {label}
      </TableCell>
    </TableRow>
  );
}

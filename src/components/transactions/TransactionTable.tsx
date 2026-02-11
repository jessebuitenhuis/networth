"use client";

import { useState, useMemo } from "react";
import { Repeat, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { formatSignedCurrency } from "@/lib/formatSignedCurrency";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { DisplayTransaction } from "@/models/DisplayTransaction";

type TransactionTableProps = {
  items: DisplayTransaction[];
};

type SortColumn = "date" | "description" | "amount" | null;
type SortDirection = "asc" | "desc";

function SortIcon({
  column,
  sortColumn,
  sortDirection,
}: {
  column: SortColumn;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}) {
  if (sortColumn !== column) return <ArrowUpDown className="h-3 w-3" />;
  return sortDirection === "asc" ? (
    <ArrowUp className="h-3 w-3" />
  ) : (
    <ArrowDown className="h-3 w-3" />
  );
}

export function TransactionTable({ items }: TransactionTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedItems = useMemo(() => {
    if (!sortColumn) return items;

    const sorted = [...items].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;

      switch (sortColumn) {
        case "date":
          aVal = a.date;
          bVal = b.date;
          break;
        case "description":
          aVal = a.description.toLowerCase();
          bVal = b.description.toLowerCase();
          break;
        case "amount":
          aVal = a.amount;
          bVal = b.amount;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [items, sortColumn, sortDirection]);

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead
            className="text-left cursor-pointer select-none"
            onClick={() => handleSort("date")}
          >
            <div className="flex items-center gap-1">
              Date
              <SortIcon
                column="date"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
              />
            </div>
          </TableHead>
          <TableHead
            className="text-left cursor-pointer select-none"
            onClick={() => handleSort("description")}
          >
            <div className="flex items-center gap-1">
              Description
              <SortIcon
                column="description"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
              />
            </div>
          </TableHead>
          <TableHead
            className="text-right cursor-pointer select-none"
            onClick={() => handleSort("amount")}
          >
            <div className="flex items-center justify-end gap-1">
              Amount
              <SortIcon
                column="amount"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
              />
            </div>
          </TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedItems.map((item) => (
          <TableRow
            key={item.id}
            className={cn("group", item.isProjected && "border-dashed")}
          >
            <TableCell className="text-left text-muted-foreground">
              {new Date(item.date + "T00:00:00").toLocaleDateString("en-US")}
            </TableCell>
            <TableCell className="text-left">
              <span
                className={cn(item.isProjected && "text-muted-foreground")}
              >
                {item.description}
              </span>
              {item.isRecurring && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Repeat className="h-3 w-3" />
                  Recurring
                </span>
              )}
            </TableCell>
            <TableCell className="text-right">
              <span
                className={cn(
                  "font-mono",
                  item.amount >= 0 ? "text-green-600" : "text-red-600"
                )}
              >
                {formatSignedCurrency(item.amount)}
              </span>
            </TableCell>
            <TableCell className="text-right">
              <div className="opacity-0 group-hover:opacity-100">
                {item.editAction}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

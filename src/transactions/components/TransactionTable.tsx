"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, FlaskConical, Repeat, Tag } from "lucide-react";
import { useMemo, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatSignedCurrency } from "@/lib/formatSignedCurrency";
import { getBrowserLocale } from "@/lib/getLocale";
import { cn } from "@/lib/utils";
import type { DisplayTransaction } from "@/transactions/DisplayTransaction.type";

type TransactionTableProps = {
  items: DisplayTransaction[];
  showAccountColumn?: boolean;
};

type SortDirection = "asc" | "desc";

type ColumnDefinition = {
  key: string;
  label: string;
  headerClassName: string;
  getSortValue: (item: DisplayTransaction) => string | number;
};

const sortableColumns: ColumnDefinition[] = [
  {
    key: "date",
    label: "Date",
    headerClassName: "w-[120px] text-left",
    getSortValue: (item) => item.date,
  },
  {
    key: "description",
    label: "Description",
    headerClassName: "w-[40%] text-left",
    getSortValue: (item) => item.description.toLowerCase(),
  },
  {
    key: "account",
    label: "Account",
    headerClassName: "w-[180px] text-left",
    getSortValue: (item) => item.accountName.toLowerCase(),
  },
  {
    key: "category",
    label: "Category",
    headerClassName: "w-[160px] text-left",
    getSortValue: (item) => (item.categoryName || "").toLowerCase(),
  },
  {
    key: "amount",
    label: "Amount",
    headerClassName: "w-[140px] text-right",
    getSortValue: (item) => item.amount,
  },
];

function SortIcon({
  column,
  sortColumn,
  sortDirection,
}: {
  column: string;
  sortColumn: string | null;
  sortDirection: SortDirection;
}) {
  if (sortColumn !== column) return <ArrowUpDown className="h-3 w-3" />;
  return sortDirection === "asc" ? (
    <ArrowUp className="h-3 w-3" />
  ) : (
    <ArrowDown className="h-3 w-3" />
  );
}

export function TransactionTable({ items, showAccountColumn = true }: TransactionTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const columns = useMemo(
    () => showAccountColumn ? sortableColumns : sortableColumns.filter((c) => c.key !== "account"),
    [showAccountColumn]
  );

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const activeColumnDef = columns.find((c) => c.key === sortColumn);

  const sortedItems = useMemo(() => {
    if (!activeColumnDef) return items;

    return [...items].sort((a, b) => {
      const aVal = activeColumnDef.getSortValue(a);
      const bVal = activeColumnDef.getSortValue(b);

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [items, activeColumnDef, sortDirection]);

  return (
    <div className="w-full overflow-x-auto">
      <Table className="table-fixed">
        <TableHeader>
        <TableRow className="hover:bg-transparent">
          {columns.map((col) => (
            <TableHead
              key={col.key}
              className={cn(col.headerClassName, "cursor-pointer select-none")}
              onClick={() => handleSort(col.key)}
            >
              <div className={cn("flex items-center gap-1", col.key === "amount" && "justify-end")}>
                {col.label}
                <SortIcon
                  column={col.key}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                />
              </div>
            </TableHead>
          ))}
          <TableHead className="w-[100px] text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedItems.map((item) => (
          <TableRow
            key={item.id}
            className={cn("group", item.isProjected && "border-dashed")}
          >
            <TableCell className="text-left text-muted-foreground">
              {new Date(item.date + "T00:00:00").toLocaleDateString(getBrowserLocale())}
            </TableCell>
            <TableCell className="text-left">
              <span
                className={cn("break-words whitespace-normal", item.isProjected && "text-muted-foreground")}
              >
                {item.description}
              </span>
              {item.isRecurring && (
                <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Repeat className="h-3 w-3" />
                  Recurring
                </span>
              )}
              {item.scenarioName && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      aria-label={`Scenario: ${item.scenarioName}`}
                      className="ml-2 inline-flex items-center text-xs text-muted-foreground"
                    >
                      <FlaskConical className="h-3 w-3" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{item.scenarioName}</TooltipContent>
                </Tooltip>
              )}
            </TableCell>
            {showAccountColumn && (
              <TableCell className="text-left text-muted-foreground">
                {item.accountName}
              </TableCell>
            )}
            <TableCell className="text-left text-muted-foreground">
              {item.categoryName && (
                <span className="inline-flex items-center gap-1 text-xs">
                  <Tag className="h-3 w-3" />
                  {item.categoryName}
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
    </div>
  );
}

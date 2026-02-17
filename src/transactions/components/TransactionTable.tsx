"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, FlaskConical,Repeat } from "lucide-react";
import { useMemo,useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent,TooltipTrigger } from "@/components/ui/tooltip";
import { formatSignedCurrency } from "@/lib/formatSignedCurrency";
import { getBrowserLocale } from "@/lib/getLocale";
import { cn } from "@/lib/utils";
import type { DisplayTransaction } from "@/transactions/DisplayTransaction.type";

type TransactionTableProps = {
  items: DisplayTransaction[];
};

type SortColumn = "date" | "description" | "account" | "amount" | null;
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
        case "account":
          aVal = a.accountName.toLowerCase();
          bVal = b.accountName.toLowerCase();
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
    <div className="w-full overflow-x-auto">
      <Table className="table-fixed">
        <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead
            className="w-[120px] text-left cursor-pointer select-none"
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
            className="w-[40%] text-left cursor-pointer select-none"
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
            className="w-[180px] text-left cursor-pointer select-none"
            onClick={() => handleSort("account")}
          >
            <div className="flex items-center gap-1">
              Account
              <SortIcon
                column="account"
                sortColumn={sortColumn}
                sortDirection={sortDirection}
              />
            </div>
          </TableHead>
          <TableHead
            className="w-[140px] text-right cursor-pointer select-none"
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
            <TableCell className="text-left text-muted-foreground">
              {item.accountName}
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

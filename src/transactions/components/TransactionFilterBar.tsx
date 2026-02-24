"use client";

import { X } from "lucide-react";

import { AmountRangeFilter } from "@/components/shared/AmountRangeFilter";
import { DateRangeFilter } from "@/components/shared/DateRangeFilter";
import type { MultiSelectPickerItem } from "@/components/shared/MultiSelectPicker";
import { MultiSelectPicker } from "@/components/shared/MultiSelectPicker";
import { SearchInput } from "@/components/shared/SearchInput";
import { Button } from "@/components/ui/button";
import {
  emptyFilters,
  type TransactionFilters,
} from "@/transactions/TransactionFilters.type";

import { hasActiveFilters } from "../filterDisplayTransactions";

type TransactionFilterBarProps = {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
  resultCount: number;
  totalCount: number;
  showAccountFilter?: boolean;
  accounts?: MultiSelectPickerItem[];
  categories?: MultiSelectPickerItem[];
};

export function TransactionFilterBar({
  filters,
  onChange,
  resultCount,
  totalCount,
  showAccountFilter = false,
  accounts = [],
  categories = [],
}: TransactionFilterBarProps) {
  const isActive = hasActiveFilters(filters);

  const updateFilter = (key: keyof TransactionFilters, value: string | Set<string>) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleSet = (key: "accountIds" | "categoryIds", id: string) => {
    const next = new Set(filters[key]);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    updateFilter(key, next);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={filters.description}
          placeholder="Search transactions..."
          onChange={(v) => updateFilter("description", v)}
        />

        <DateRangeFilter
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          onDateFromChange={(v) => updateFilter("dateFrom", v)}
          onDateToChange={(v) => updateFilter("dateTo", v)}
          onClear={() => onChange({ ...filters, dateFrom: "", dateTo: "" })}
        />

        <AmountRangeFilter
          amountMin={filters.amountMin}
          amountMax={filters.amountMax}
          onAmountMinChange={(v) => updateFilter("amountMin", v)}
          onAmountMaxChange={(v) => updateFilter("amountMax", v)}
          onClear={() => onChange({ ...filters, amountMin: "", amountMax: "" })}
        />

        {showAccountFilter && accounts.length > 0 && (
          <MultiSelectPicker
            label="Accounts"
            items={accounts}
            selectedIds={filters.accountIds}
            onToggle={(id) => toggleSet("accountIds", id)}
            onClearAll={() => updateFilter("accountIds", new Set())}
          />
        )}

        {categories.length > 0 && (
          <MultiSelectPicker
            label="Categories"
            items={categories}
            selectedIds={filters.categoryIds}
            onToggle={(id) => toggleSet("categoryIds", id)}
            onClearAll={() => updateFilter("categoryIds", new Set())}
          />
        )}

        {isActive && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(emptyFilters)}
            aria-label="Clear filters"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isActive && (
        <p className="text-sm text-muted-foreground">
          Showing {resultCount} of {totalCount} transactions
        </p>
      )}
    </div>
  );
}

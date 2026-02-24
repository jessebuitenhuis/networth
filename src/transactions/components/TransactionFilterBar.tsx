"use client";

import { Search, X } from "lucide-react";
import { useRef, useState } from "react";

import { AmountRangeFilter } from "@/components/shared/AmountRangeFilter";
import { DateRangeFilter } from "@/components/shared/DateRangeFilter";
import type { MultiSelectPickerItem } from "@/components/shared/MultiSelectPicker";
import { MultiSelectPicker } from "@/components/shared/MultiSelectPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type SearchInputProps = {
  value: string;
  isOpen: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onOpen: () => void;
  onChange: (value: string) => void;
  onBlur: () => void;
};

function SearchInput({ value, isOpen, inputRef, onOpen, onChange, onBlur }: SearchInputProps) {
  if (!isOpen) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={onOpen} aria-label="Open search">
        <Search className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search transactions..."
        aria-label="Search transactions"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="pl-9 h-8 w-48"
      />
    </div>
  );
}

export function TransactionFilterBar({
  filters,
  onChange,
  resultCount,
  totalCount,
  showAccountFilter = false,
  accounts = [],
  categories = [],
}: TransactionFilterBarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(filters.description !== "");
  const searchRef = useRef<HTMLInputElement>(null);
  const isActive = hasActiveFilters(filters);

  const updateFilter = (key: keyof TransactionFilters, value: string | Set<string>) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onChange(emptyFilters);
    setIsSearchOpen(false);
  };

  const openSearch = () => {
    setIsSearchOpen(true);
    setTimeout(() => searchRef.current?.focus(), 0);
  };

  const handleSearchBlur = () => {
    if (filters.description === "") setIsSearchOpen(false);
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
          isOpen={isSearchOpen}
          inputRef={searchRef}
          onOpen={openSearch}
          onChange={(v) => updateFilter("description", v)}
          onBlur={handleSearchBlur}
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
            onClick={clearFilters}
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

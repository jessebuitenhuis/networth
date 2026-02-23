"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

import type { Account } from "@/accounts/Account.type";
import type { Category } from "@/categories/Category.type";
import { MultiSelectPicker } from "@/components/shared/MultiSelectPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  accounts?: Account[];
  categories?: Category[];
};

export function TransactionFilterBar({
  filters,
  onChange,
  resultCount,
  totalCount,
  accounts,
  categories,
}: TransactionFilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isActive = hasActiveFilters(filters);
  const hasAdvancedFilters =
    filters.dateFrom !== "" ||
    filters.dateTo !== "" ||
    filters.amountMin !== "" ||
    filters.amountMax !== "" ||
    filters.accountIds.length > 0 ||
    filters.categoryIds.length > 0;

  const updateFilter = (key: keyof TransactionFilters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onChange(emptyFilters);
    setIsExpanded(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search transactions..."
            aria-label="Search transactions"
            value={filters.description}
            onChange={(e) => updateFilter("description", e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          type="button"
          variant={hasAdvancedFilters ? "default" : "outline"}
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label="Toggle filters"
          aria-expanded={isExpanded}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
        {isActive && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearFilters}
            aria-label="Clear filters"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-3 rounded-lg border p-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="space-y-1">
              <Label htmlFor="filter-date-from" className="text-xs">
                From date
              </Label>
              <Input
                id="filter-date-from"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter("dateFrom", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="filter-date-to" className="text-xs">
                To date
              </Label>
              <Input
                id="filter-date-to"
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter("dateTo", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="filter-amount-min" className="text-xs">
                Min amount
              </Label>
              <Input
                id="filter-amount-min"
                type="number"
                step="any"
                placeholder="Min"
                value={filters.amountMin}
                onChange={(e) => updateFilter("amountMin", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="filter-amount-max" className="text-xs">
                Max amount
              </Label>
              <Input
                id="filter-amount-max"
                type="number"
                step="any"
                placeholder="Max"
                value={filters.amountMax}
                onChange={(e) => updateFilter("amountMax", e.target.value)}
              />
            </div>
          </div>
          {(accounts || categories) && (
            <div className="flex flex-wrap gap-2">
              {accounts && (
                <MultiSelectPicker
                  label="Accounts"
                  items={accounts.map((a) => ({ id: a.id, label: a.name }))}
                  selectedIds={new Set(filters.accountIds)}
                  onToggle={(id) => {
                    const next = filters.accountIds.includes(id)
                      ? filters.accountIds.filter((x) => x !== id)
                      : [...filters.accountIds, id];
                    onChange({ ...filters, accountIds: next });
                  }}
                  onClearAll={() => onChange({ ...filters, accountIds: [] })}
                />
              )}
              {categories && (
                <MultiSelectPicker
                  label="Categories"
                  items={categories.map((c) => ({ id: c.id, label: c.name }))}
                  selectedIds={new Set(filters.categoryIds)}
                  onToggle={(id) => {
                    const next = filters.categoryIds.includes(id)
                      ? filters.categoryIds.filter((x) => x !== id)
                      : [...filters.categoryIds, id];
                    onChange({ ...filters, categoryIds: next });
                  }}
                  onClearAll={() => onChange({ ...filters, categoryIds: [] })}
                />
              )}
            </div>
          )}
        </div>
      )}

      {isActive && (
        <p className="text-sm text-muted-foreground">
          Showing {resultCount} of {totalCount} transactions
        </p>
      )}
    </div>
  );
}

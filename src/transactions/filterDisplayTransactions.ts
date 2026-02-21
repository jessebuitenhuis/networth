import type { DisplayTransaction } from "./DisplayTransaction.type";
import type { TransactionFilters } from "./TransactionFilters.type";

export function filterDisplayTransactions(
  items: DisplayTransaction[],
  filters: TransactionFilters
): DisplayTransaction[] {
  return items.filter((item) => {
    if (
      filters.description &&
      !item.description.toLowerCase().includes(filters.description.toLowerCase())
    ) {
      return false;
    }

    if (filters.dateFrom && item.date < filters.dateFrom) {
      return false;
    }

    if (filters.dateTo && item.date > filters.dateTo) {
      return false;
    }

    if (filters.amountMin !== "") {
      const min = parseFloat(filters.amountMin);
      if (!isNaN(min) && item.amount < min) {
        return false;
      }
    }

    if (filters.amountMax !== "") {
      const max = parseFloat(filters.amountMax);
      if (!isNaN(max) && item.amount > max) {
        return false;
      }
    }

    return true;
  });
}

export function hasActiveFilters(filters: TransactionFilters): boolean {
  return (
    filters.description !== "" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== "" ||
    filters.amountMin !== "" ||
    filters.amountMax !== ""
  );
}

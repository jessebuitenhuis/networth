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

    if (filters.accountIds.length > 0 && (!item.accountId || !filters.accountIds.includes(item.accountId))) {
      return false;
    }

    if (filters.categoryIds.length > 0 && (!item.categoryId || !filters.categoryIds.includes(item.categoryId))) {
      return false;
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
    filters.amountMax !== "" ||
    filters.accountIds.length > 0 ||
    filters.categoryIds.length > 0
  );
}

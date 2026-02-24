export type TransactionFilters = {
  description: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  accountIds: Set<string>;
  categoryIds: Set<string>;
};

export const emptyFilters: TransactionFilters = {
  description: "",
  dateFrom: "",
  dateTo: "",
  amountMin: "",
  amountMax: "",
  accountIds: new Set(),
  categoryIds: new Set(),
};

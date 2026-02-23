export type TransactionFilters = {
  description: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
  accountIds: string[];
  categoryIds: string[];
};

export const emptyFilters: TransactionFilters = {
  description: "",
  dateFrom: "",
  dateTo: "",
  amountMin: "",
  amountMax: "",
  accountIds: [],
  categoryIds: [],
};

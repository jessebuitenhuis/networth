import type { Transaction } from "@/transactions/Transaction.type";

import type { CsvSkippedRow } from "./CsvSkippedRow.type";

export type CsvParseResult = {
  transactions: Transaction[];
  skippedRows: CsvSkippedRow[];
};

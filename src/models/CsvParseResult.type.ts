import type { CsvSkippedRow } from "./CsvSkippedRow.type";
import type { Transaction } from "./Transaction.type";

export type CsvParseResult = {
  transactions: Transaction[];
  skippedRows: CsvSkippedRow[];
};

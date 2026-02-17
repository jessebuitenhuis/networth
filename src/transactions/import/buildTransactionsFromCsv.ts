import type { CsvColumnMapping } from "@/transactions/import/CsvColumnMapping.type";
import type { CsvParseResult } from "@/transactions/import/CsvParseResult.type";
import type { CsvSkippedRow } from "@/transactions/import/CsvSkippedRow.type";
import { DateFormat } from "@/transactions/import/DateFormat";
import type { Transaction } from "@/transactions/Transaction.type";

export function buildTransactionsFromCsv(
  rows: string[][],
  mapping: CsvColumnMapping,
  dateFormat: DateFormat,
  accountId: string,
  idGenerator: () => string,
): CsvParseResult {
  const transactions: Transaction[] = [];
  const skippedRows: CsvSkippedRow[] = [];

  rows.forEach((row, index) => {
    if (_isEmptyRow(row)) {
      return;
    }

    if (
      row.length <= mapping.dateColumn ||
      row.length <= mapping.amountColumn ||
      row.length <= mapping.descriptionColumn
    ) {
      skippedRows.push({
        rowIndex: index,
        reason: "Missing required columns",
        rawValues: row,
      });
      return;
    }

    const dateStr = row[mapping.dateColumn];
    const amountStr = row[mapping.amountColumn];
    const description = row[mapping.descriptionColumn];

    const parsedDate = _parseDate(dateStr, dateFormat);
    if (!parsedDate) {
      skippedRows.push({
        rowIndex: index,
        reason: "Invalid date format",
        rawValues: row,
      });
      return;
    }

    const parsedAmount = _parseAmount(amountStr);
    if (parsedAmount === null) {
      skippedRows.push({
        rowIndex: index,
        reason: "Invalid amount format",
        rawValues: row,
      });
      return;
    }

    transactions.push({
      id: idGenerator(),
      accountId,
      date: parsedDate,
      amount: parsedAmount,
      description,
    });
  });

  return { transactions, skippedRows };
}

function _isEmptyRow(row: string[]): boolean {
  return row.every((cell) => cell.trim() === "");
}

function _parseDate(dateStr: string, format: DateFormat): string | null {
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  let year: number;
  let month: number;
  let day: number;

  switch (format) {
    case DateFormat.YYYY_MM_DD: {
      const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!match) return null;
      [, year, month, day] = match.map(Number);
      break;
    }
    case DateFormat.MM_DD_YYYY: {
      const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!match) return null;
      [, month, day, year] = match.map(Number);
      break;
    }
    case DateFormat.DD_MM_YYYY: {
      const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!match) return null;
      [, day, month, year] = match.map(Number);
      break;
    }
    case DateFormat.MM_DD_YYYY_DASH: {
      const match = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);
      if (!match) return null;
      [, month, day, year] = match.map(Number);
      break;
    }
    case DateFormat.DD_MM_YYYY_DASH: {
      const match = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);
      if (!match) return null;
      [, day, month, year] = match.map(Number);
      break;
    }
  }

  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1000) {
    return null;
  }

  const paddedMonth = String(month).padStart(2, "0");
  const paddedDay = String(day).padStart(2, "0");
  return `${year}-${paddedMonth}-${paddedDay}`;
}

function _parseAmount(amountStr: string): number | null {
  const cleaned = amountStr.replace(/[\$,]/g, "").trim();
  if (!cleaned) return null;

  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return null;

  return parsed;
}

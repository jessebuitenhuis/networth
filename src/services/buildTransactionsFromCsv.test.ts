import { describe, expect, it } from "vitest";

import type { CsvColumnMapping } from "@/models/CsvColumnMapping.type";
import { DateFormat } from "@/models/DateFormat";

import { buildTransactionsFromCsv } from "./buildTransactionsFromCsv";

describe("buildTransactionsFromCsv", () => {
  const mapping: CsvColumnMapping = {
    dateColumn: 0,
    amountColumn: 1,
    descriptionColumn: 2,
  };
  const accountId = "account-1";

  describe("happy path", () => {
    it("converts valid rows to transactions with correct accountId", () => {
      const rows = [
        ["2024-01-15", "100.00", "Groceries"],
        ["2024-01-16", "-50.00", "Gas"],
      ];
      let idCounter = 1;
      const idGenerator = () => `tx-${idCounter++}`;

      const result = buildTransactionsFromCsv(
        rows,
        mapping,
        DateFormat.YYYY_MM_DD,
        accountId,
        idGenerator,
      );

      expect(result.transactions).toHaveLength(2);
      expect(result.transactions[0]).toEqual({
        id: "tx-1",
        accountId: "account-1",
        date: "2024-01-15",
        amount: 100.0,
        description: "Groceries",
      });
      expect(result.transactions[1]).toEqual({
        id: "tx-2",
        accountId: "account-1",
        date: "2024-01-16",
        amount: -50.0,
        description: "Gas",
      });
      expect(result.skippedRows).toHaveLength(0);
    });

    it("uses idGenerator for each transaction ID", () => {
      const rows = [["2024-01-15", "100.00", "Groceries"]];
      const idGenerator = () => "custom-id";

      const result = buildTransactionsFromCsv(
        rows,
        mapping,
        DateFormat.YYYY_MM_DD,
        accountId,
        idGenerator,
      );

      expect(result.transactions[0].id).toBe("custom-id");
    });
  });

  describe("date formats", () => {
    it.each([
      [DateFormat.YYYY_MM_DD, "2024-01-15", "2024-01-15"],
      [DateFormat.MM_DD_YYYY, "01/15/2024", "2024-01-15"],
      [DateFormat.DD_MM_YYYY, "15/01/2024", "2024-01-15"],
      [DateFormat.MM_DD_YYYY_DASH, "01-15-2024", "2024-01-15"],
      [DateFormat.DD_MM_YYYY_DASH, "15-01-2024", "2024-01-15"],
    ])("parses %s format: %s -> %s", (format, input, expected) => {
      const rows = [[input, "100.00", "Test"]];
      const idGenerator = () => "tx-1";

      const result = buildTransactionsFromCsv(
        rows,
        mapping,
        format,
        accountId,
        idGenerator,
      );

      expect(result.transactions[0].date).toBe(expected);
    });

    it("skips row with invalid date values (month out of range)", () => {
      const rows = [["2024-13-15", "100.00", "Test"]];
      const idGenerator = () => "tx-1";

      const result = buildTransactionsFromCsv(
        rows,
        mapping,
        DateFormat.YYYY_MM_DD,
        accountId,
        idGenerator,
      );

      expect(result.transactions).toHaveLength(0);
      expect(result.skippedRows).toHaveLength(1);
    });

    it("skips row with invalid date values (day out of range)", () => {
      const rows = [["2024-01-32", "100.00", "Test"]];
      const idGenerator = () => "tx-1";

      const result = buildTransactionsFromCsv(
        rows,
        mapping,
        DateFormat.YYYY_MM_DD,
        accountId,
        idGenerator,
      );

      expect(result.transactions).toHaveLength(0);
      expect(result.skippedRows).toHaveLength(1);
    });

    it("skips row with empty date string", () => {
      const rows = [["", "100.00", "Test"]];
      const idGenerator = () => "tx-1";

      const result = buildTransactionsFromCsv(
        rows,
        mapping,
        DateFormat.YYYY_MM_DD,
        accountId,
        idGenerator,
      );

      expect(result.transactions).toHaveLength(0);
      expect(result.skippedRows).toHaveLength(1);
    });

    it.each([
      [DateFormat.MM_DD_YYYY, "2024-01-15"],
      [DateFormat.DD_MM_YYYY, "2024-01-15"],
      [DateFormat.MM_DD_YYYY_DASH, "01/15/2024"],
      [DateFormat.DD_MM_YYYY_DASH, "01/15/2024"],
    ])(
      "skips row when date doesn't match %s format pattern",
      (format, invalidDate) => {
        const rows = [[invalidDate, "100.00", "Test"]];
        const idGenerator = () => "tx-1";

        const result = buildTransactionsFromCsv(
          rows,
          mapping,
          format,
          accountId,
          idGenerator,
        );

        expect(result.transactions).toHaveLength(0);
        expect(result.skippedRows).toHaveLength(1);
      },
    );
  });

  describe("amount parsing", () => {
    it("parses negative amounts", () => {
      const rows = [["2024-01-15", "-500.00", "Expense"]];
      const idGenerator = () => "tx-1";

      const result = buildTransactionsFromCsv(
        rows,
        mapping,
        DateFormat.YYYY_MM_DD,
        accountId,
        idGenerator,
      );

      expect(result.transactions[0].amount).toBe(-500.0);
    });

    it("parses dollar sign and thousands separator", () => {
      const rows = [["2024-01-15", "$1,234.56", "Salary"]];
      const idGenerator = () => "tx-1";

      const result = buildTransactionsFromCsv(
        rows,
        mapping,
        DateFormat.YYYY_MM_DD,
        accountId,
        idGenerator,
      );

      expect(result.transactions[0].amount).toBe(1234.56);
    });

    it("parses plain integers", () => {
      const rows = [["2024-01-15", "100", "Cash"]];
      const idGenerator = () => "tx-1";

      const result = buildTransactionsFromCsv(
        rows,
        mapping,
        DateFormat.YYYY_MM_DD,
        accountId,
        idGenerator,
      );

      expect(result.transactions[0].amount).toBe(100);
    });

    it("skips row with empty amount after cleaning", () => {
      const rows = [["2024-01-15", "$", "Test"]];
      const idGenerator = () => "tx-1";

      const result = buildTransactionsFromCsv(
        rows,
        mapping,
        DateFormat.YYYY_MM_DD,
        accountId,
        idGenerator,
      );

      expect(result.transactions).toHaveLength(0);
      expect(result.skippedRows).toHaveLength(1);
      expect(result.skippedRows[0].reason).toBe("Invalid amount format");
    });
  });

  describe("error handling", () => {
    it("skips row with unparseable date", () => {
      const rows = [
        ["invalid-date", "100.00", "Test"],
        ["2024-01-15", "100.00", "Valid"],
      ];
      const idGenerator = () => "tx-1";

      const result = buildTransactionsFromCsv(
        rows,
        mapping,
        DateFormat.YYYY_MM_DD,
        accountId,
        idGenerator,
      );

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].description).toBe("Valid");
      expect(result.skippedRows).toHaveLength(1);
      expect(result.skippedRows[0]).toEqual({
        rowIndex: 0,
        reason: "Invalid date format",
        rawValues: ["invalid-date", "100.00", "Test"],
      });
    });

    it("skips row with non-numeric amount", () => {
      const rows = [
        ["2024-01-15", "not-a-number", "Test"],
        ["2024-01-16", "100.00", "Valid"],
      ];
      const idGenerator = () => "tx-1";

      const result = buildTransactionsFromCsv(
        rows,
        mapping,
        DateFormat.YYYY_MM_DD,
        accountId,
        idGenerator,
      );

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].description).toBe("Valid");
      expect(result.skippedRows).toHaveLength(1);
      expect(result.skippedRows[0]).toEqual({
        rowIndex: 0,
        reason: "Invalid amount format",
        rawValues: ["2024-01-15", "not-a-number", "Test"],
      });
    });

    it("silently skips fully empty rows", () => {
      const rows = [
        ["2024-01-15", "100.00", "Valid"],
        ["", "", ""],
        ["2024-01-16", "50.00", "Also valid"],
      ];
      const idGenerator = () => "tx-1";

      const result = buildTransactionsFromCsv(
        rows,
        mapping,
        DateFormat.YYYY_MM_DD,
        accountId,
        idGenerator,
      );

      expect(result.transactions).toHaveLength(2);
      expect(result.skippedRows).toHaveLength(0);
    });

    it("skips row with column index out of bounds", () => {
      const rows = [
        ["2024-01-15", "100.00"],
        ["2024-01-16", "50.00", "Valid"],
      ];
      const idGenerator = () => "tx-1";

      const result = buildTransactionsFromCsv(
        rows,
        mapping,
        DateFormat.YYYY_MM_DD,
        accountId,
        idGenerator,
      );

      expect(result.transactions).toHaveLength(1);
      expect(result.transactions[0].description).toBe("Valid");
      expect(result.skippedRows).toHaveLength(1);
      expect(result.skippedRows[0]).toEqual({
        rowIndex: 0,
        reason: "Missing required columns",
        rawValues: ["2024-01-15", "100.00"],
      });
    });

    it("handles mix of valid and invalid rows", () => {
      const rows = [
        ["2024-01-15", "100.00", "Valid 1"],
        ["invalid-date", "100.00", "Bad date"],
        ["2024-01-16", "not-a-number", "Bad amount"],
        ["2024-01-17", "50.00", "Valid 2"],
      ];
      let idCounter = 1;
      const idGenerator = () => `tx-${idCounter++}`;

      const result = buildTransactionsFromCsv(
        rows,
        mapping,
        DateFormat.YYYY_MM_DD,
        accountId,
        idGenerator,
      );

      expect(result.transactions).toHaveLength(2);
      expect(result.transactions[0].description).toBe("Valid 1");
      expect(result.transactions[1].description).toBe("Valid 2");
      expect(result.skippedRows).toHaveLength(2);
    });

    it("returns empty transactions and populated skippedRows for all-invalid rows", () => {
      const rows = [
        ["invalid-date", "100.00", "Bad date"],
        ["2024-01-16", "not-a-number", "Bad amount"],
      ];
      const idGenerator = () => "tx-1";

      const result = buildTransactionsFromCsv(
        rows,
        mapping,
        DateFormat.YYYY_MM_DD,
        accountId,
        idGenerator,
      );

      expect(result.transactions).toHaveLength(0);
      expect(result.skippedRows).toHaveLength(2);
    });
  });
});

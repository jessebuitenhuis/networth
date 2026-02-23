import { describe, expect, it } from "vitest";

import { autoDetectColumns } from "./columnMatchers";

describe("autoDetectColumns", () => {
  describe("English headers", () => {
    it("detects standard English column names", () => {
      const result = autoDetectColumns(["Date", "Amount", "Description"]);
      expect(result).toEqual({
        dateColumn: 0,
        amountColumn: 1,
        descriptionColumn: 2,
      });
    });

    it("detects case-insensitive headers", () => {
      const result = autoDetectColumns(["DATE", "AMOUNT", "DESCRIPTION"]);
      expect(result).toEqual({
        dateColumn: 0,
        amountColumn: 1,
        descriptionColumn: 2,
      });
    });

    it("detects alternative English names", () => {
      const result = autoDetectColumns(["Timestamp", "Credit", "Memo"]);
      expect(result).toEqual({
        dateColumn: 0,
        amountColumn: 1,
        descriptionColumn: 2,
      });
    });
  });

  describe("Dutch headers", () => {
    it("detects Dutch column names", () => {
      const result = autoDetectColumns(["Datum", "Bedrag", "Omschrijving"]);
      expect(result).toEqual({
        dateColumn: 0,
        amountColumn: 1,
        descriptionColumn: 2,
      });
    });

    it("detects Dutch bank-specific names", () => {
      const result = autoDetectColumns([
        "Boekdatum",
        "Bij",
        "Naam / Omschrijving",
      ]);
      expect(result).toEqual({
        dateColumn: 0,
        amountColumn: 1,
        descriptionColumn: 2,
      });
    });
  });

  describe("German headers", () => {
    it("detects German column names", () => {
      const result = autoDetectColumns([
        "Buchungstag",
        "Betrag",
        "Verwendungszweck",
      ]);
      expect(result).toEqual({
        dateColumn: 0,
        amountColumn: 1,
        descriptionColumn: 2,
      });
    });

    it("detects alternative German names", () => {
      const result = autoDetectColumns([
        "Valutadatum",
        "Umsatz",
        "Buchungstext",
      ]);
      expect(result).toEqual({
        dateColumn: 0,
        amountColumn: 1,
        descriptionColumn: 2,
      });
    });
  });

  describe("Spanish headers", () => {
    it("detects Spanish column names", () => {
      const result = autoDetectColumns(["Fecha", "Monto", "Concepto"]);
      expect(result).toEqual({
        dateColumn: 0,
        amountColumn: 1,
        descriptionColumn: 2,
      });
    });
  });

  describe("unrecognized headers", () => {
    it("returns -1 for unrecognized columns", () => {
      const result = autoDetectColumns(["Col1", "Col2", "Col3"]);
      expect(result).toEqual({
        dateColumn: -1,
        amountColumn: -1,
        descriptionColumn: -1,
      });
    });

    it("partially detects when only some headers match", () => {
      const result = autoDetectColumns(["Date", "Col2", "Description"]);
      expect(result).toEqual({
        dateColumn: 0,
        amountColumn: -1,
        descriptionColumn: 2,
      });
    });
  });
});

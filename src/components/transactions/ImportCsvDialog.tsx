"use client";

import { Upload } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTransactions } from "@/context/TransactionContext";
import { generateId } from "@/lib/generateId";
import type { CsvColumnMapping } from "@/models/CsvColumnMapping.type";
import { CsvImportStep } from "@/models/CsvImportStep";
import type { CsvParseResult } from "@/models/CsvParseResult.type";
import { DateFormat } from "@/models/DateFormat";
import { buildTransactionsFromCsv } from "@/services/buildTransactionsFromCsv";
import { parseCsvText } from "@/services/parseCsvText";

type ImportCsvDialogProps = {
  accountId: string;
};

export function ImportCsvDialog({ accountId }: ImportCsvDialogProps) {
  const { addTransactions } = useTransactions();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(CsvImportStep.Upload);
  const [headers, setHeaders] = useState<string[]>([]);
  const [dataRows, setDataRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<CsvColumnMapping>({
    dateColumn: -1,
    amountColumn: -1,
    descriptionColumn: -1,
  });
  const [dateFormat, setDateFormat] = useState<DateFormat>(DateFormat.YYYY_MM_DD);
  const [parseResult, setParseResult] = useState<CsvParseResult>({
    transactions: [],
    skippedRows: [],
  });
  const [fileError, setFileError] = useState("");

  function resetForm() {
    setStep(CsvImportStep.Upload);
    setHeaders([]);
    setDataRows([]);
    setMapping({ dateColumn: -1, amountColumn: -1, descriptionColumn: -1 });
    setDateFormat(DateFormat.YYYY_MM_DD);
    setParseResult({ transactions: [], skippedRows: [] });
    setFileError("");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text || text.trim() === "") {
        setFileError("CSV file is empty");
        return;
      }

      const rows = parseCsvText(text);
      if (rows.length === 0) {
        setFileError("CSV file is empty");
        return;
      }

      const [headerRow, ...data] = rows;
      setHeaders(headerRow);
      setDataRows(data);
      setFileError("");

      const autoMapping = _autoDetectColumns(headerRow);
      setMapping(autoMapping);

      setStep(CsvImportStep.Mapping);
    };
    reader.readAsText(file);
  }

  function handleNext() {
    const result = buildTransactionsFromCsv(
      dataRows,
      mapping,
      dateFormat,
      accountId,
      generateId,
    );
    setParseResult(result);
    setStep(CsvImportStep.Preview);
  }

  function handleBack() {
    if (step === CsvImportStep.Mapping) {
      setStep(CsvImportStep.Upload);
    } else if (step === CsvImportStep.Preview) {
      setStep(CsvImportStep.Mapping);
    }
  }

  function handleImport() {
    addTransactions(parseResult.transactions);
    setIsOpen(false);
    resetForm();
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  }

  const isMappingValid =
    mapping.dateColumn >= 0 &&
    mapping.amountColumn >= 0 &&
    mapping.descriptionColumn >= 0;

  const hasValidTransactions = parseResult.transactions.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file and map columns to import transactions
          </DialogDescription>
        </DialogHeader>

        {step === CsvImportStep.Upload && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="csv-file">Select CSV file</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
              />
            </div>
            {fileError && (
              <div className="text-sm text-red-600">{fileError}</div>
            )}
          </div>
        )}

        {step === CsvImportStep.Mapping && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="date-column">Date Column</Label>
              <Select
                value={mapping.dateColumn >= 0 ? String(mapping.dateColumn) : ""}
                onValueChange={(value) =>
                  setMapping({ ...mapping, dateColumn: Number(value) })
                }
              >
                <SelectTrigger id="date-column">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {headers.map((header, index) => (
                    <SelectItem key={index} value={String(index)}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="amount-column">Amount Column</Label>
              <Select
                value={mapping.amountColumn >= 0 ? String(mapping.amountColumn) : ""}
                onValueChange={(value) =>
                  setMapping({ ...mapping, amountColumn: Number(value) })
                }
              >
                <SelectTrigger id="amount-column">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {headers.map((header, index) => (
                    <SelectItem key={index} value={String(index)}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description-column">Description Column</Label>
              <Select
                value={
                  mapping.descriptionColumn >= 0
                    ? String(mapping.descriptionColumn)
                    : ""
                }
                onValueChange={(value) =>
                  setMapping({ ...mapping, descriptionColumn: Number(value) })
                }
              >
                <SelectTrigger id="description-column">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {headers.map((header, index) => (
                    <SelectItem key={index} value={String(index)}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date-format">Date Format</Label>
              <Select
                value={dateFormat}
                onValueChange={(value) => setDateFormat(value as DateFormat)}
              >
                <SelectTrigger id="date-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DateFormat.YYYY_MM_DD}>YYYY-MM-DD</SelectItem>
                  <SelectItem value={DateFormat.MM_DD_YYYY}>MM/DD/YYYY</SelectItem>
                  <SelectItem value={DateFormat.DD_MM_YYYY}>DD/MM/YYYY</SelectItem>
                  <SelectItem value={DateFormat.MM_DD_YYYY_DASH}>
                    MM-DD-YYYY
                  </SelectItem>
                  <SelectItem value={DateFormat.DD_MM_YYYY_DASH}>
                    DD-MM-YYYY
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dataRows.length > 0 && (
              <div>
                <Label>Sample Data (first 3 rows)</Label>
                <div className="mt-2 border rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {headers.map((header, index) => (
                          <TableHead key={index}>{header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dataRows.slice(0, 3).map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <TableCell key={cellIndex}>{cell}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext} disabled={!isMappingValid}>
                Next
              </Button>
            </div>
          </div>
        )}

        {step === CsvImportStep.Preview && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">
                {parseResult.transactions.length}{" "}
                {parseResult.transactions.length === 1
                  ? "transaction"
                  : "transactions"}{" "}
                ready to import
              </p>
              {parseResult.skippedRows.length > 0 && (
                <p className="text-sm text-yellow-600">
                  {parseResult.skippedRows.length}{" "}
                  {parseResult.skippedRows.length === 1 ? "row" : "rows"} skipped
                  due to errors
                </p>
              )}
            </div>

            {parseResult.transactions.length > 0 && (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parseResult.transactions.slice(0, 10).map((tx, index) => (
                      <TableRow key={index}>
                        <TableCell>{tx.date}</TableCell>
                        <TableCell>{tx.amount}</TableCell>
                        <TableCell>{tx.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {parseResult.transactions.length > 10 && (
                  <p className="text-sm text-gray-500 p-2">
                    Showing first 10 of {parseResult.transactions.length}{" "}
                    transactions
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleImport} disabled={!hasValidTransactions}>
                Import
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function _autoDetectColumns(headers: string[]): CsvColumnMapping {
  const mapping: CsvColumnMapping = {
    dateColumn: -1,
    amountColumn: -1,
    descriptionColumn: -1,
  };

  headers.forEach((header, index) => {
    const lower = header.toLowerCase().trim();
    if (lower === "date" && mapping.dateColumn === -1) {
      mapping.dateColumn = index;
    } else if (lower === "amount" && mapping.amountColumn === -1) {
      mapping.amountColumn = index;
    } else if (lower === "description" && mapping.descriptionColumn === -1) {
      mapping.descriptionColumn = index;
    }
  });

  return mapping;
}

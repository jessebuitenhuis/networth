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
import { generateId } from "@/lib/generateId";
import { buildTransactionsFromCsv } from "@/transactions/import/buildTransactionsFromCsv";
import { autoDetectColumns } from "@/transactions/import/columnMatchers";
import type { CsvColumnMapping } from "@/transactions/import/CsvColumnMapping.type";
import { CsvImportStep } from "@/transactions/import/CsvImportStep";
import { CsvMappingStep } from "@/transactions/import/CsvMappingStep";
import type { CsvParseResult } from "@/transactions/import/CsvParseResult.type";
import { CsvPreviewStep } from "@/transactions/import/CsvPreviewStep";
import { CsvUploadStep } from "@/transactions/import/CsvUploadStep";
import { DateFormat } from "@/transactions/import/DateFormat";
import { parseCsvText } from "@/transactions/import/parseCsvText";
import { useTransactions } from "@/transactions/TransactionContext";

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
      setMapping(autoDetectColumns(headerRow));
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
          <CsvUploadStep
            fileError={fileError}
            onFileChange={handleFileChange}
          />
        )}

        {step === CsvImportStep.Mapping && (
          <CsvMappingStep
            headers={headers}
            dataRows={dataRows}
            mapping={mapping}
            dateFormat={dateFormat}
            isMappingValid={isMappingValid}
            onMappingChange={setMapping}
            onDateFormatChange={setDateFormat}
            onBack={handleBack}
            onNext={handleNext}
          />
        )}

        {step === CsvImportStep.Preview && (
          <CsvPreviewStep
            parseResult={parseResult}
            onBack={handleBack}
            onImport={handleImport}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

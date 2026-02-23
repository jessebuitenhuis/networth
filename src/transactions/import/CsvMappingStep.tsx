import { DialogFooterActions } from "@/components/shared/DialogFooterActions";
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
import type { DateFormat } from "@/transactions/import/DateFormat";
import { DATE_FORMAT_OPTIONS } from "@/transactions/import/dateFormatOptions";

import type { CsvColumnMapping } from "./CsvColumnMapping.type";

type CsvMappingStepProps = {
  headers: string[];
  dataRows: string[][];
  mapping: CsvColumnMapping;
  dateFormat: DateFormat;
  isMappingValid: boolean;
  onMappingChange: (mapping: CsvColumnMapping) => void;
  onDateFormatChange: (format: DateFormat) => void;
  onBack: () => void;
  onNext: () => void;
};

export function CsvMappingStep({
  headers,
  dataRows,
  mapping,
  dateFormat,
  isMappingValid,
  onMappingChange,
  onDateFormatChange,
  onBack,
  onNext,
}: CsvMappingStepProps) {
  const usedByDate = new Set(
    [mapping.amountColumn, mapping.descriptionColumn].filter((i) => i >= 0),
  );
  const usedByAmount = new Set(
    [mapping.dateColumn, mapping.descriptionColumn].filter((i) => i >= 0),
  );
  const usedByDescription = new Set(
    [mapping.dateColumn, mapping.amountColumn].filter((i) => i >= 0),
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <Label htmlFor="date-column">Date Column</Label>
          <Select
            value={mapping.dateColumn >= 0 ? String(mapping.dateColumn) : ""}
            onValueChange={(value) =>
              onMappingChange({ ...mapping, dateColumn: Number(value) })
            }
          >
            <SelectTrigger id="date-column">
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
              {headers.map((header, index) => (
                <SelectItem
                  key={index}
                  value={String(index)}
                  disabled={usedByDate.has(index)}
                >
                  {header}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="amount-column">Amount Column</Label>
          <Select
            value={
              mapping.amountColumn >= 0 ? String(mapping.amountColumn) : ""
            }
            onValueChange={(value) =>
              onMappingChange({ ...mapping, amountColumn: Number(value) })
            }
          >
            <SelectTrigger id="amount-column">
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
              {headers.map((header, index) => (
                <SelectItem
                  key={index}
                  value={String(index)}
                  disabled={usedByAmount.has(index)}
                >
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
              onMappingChange({
                ...mapping,
                descriptionColumn: Number(value),
              })
            }
          >
            <SelectTrigger id="description-column">
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
              {headers.map((header, index) => (
                <SelectItem
                  key={index}
                  value={String(index)}
                  disabled={usedByDescription.has(index)}
                >
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
            onValueChange={(value) => onDateFormatChange(value as DateFormat)}
          >
            <SelectTrigger id="date-format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_FORMAT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isMappingValid && dataRows.length > 0 && (
        <div>
          <Label>Mapping Preview</Label>
          <div className="mt-2 border rounded-md overflow-x-auto max-h-[200px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataRows.slice(0, 3).map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell>
                      {row[mapping.dateColumn] ?? ""}
                    </TableCell>
                    <TableCell>
                      {row[mapping.amountColumn] ?? ""}
                    </TableCell>
                    <TableCell>
                      {row[mapping.descriptionColumn] ?? ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {dataRows.length > 0 && (
        <div>
          <Label>Sample Data (first 3 rows)</Label>
          <div className="mt-2 border rounded-md overflow-x-auto max-h-[200px] overflow-y-auto">
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

      <DialogFooterActions
        onCancel={onBack}
        cancelLabel="Back"
        submitLabel="Next"
        isSubmitDisabled={!isMappingValid}
        onSubmit={onNext}
      />
    </div>
  );
}

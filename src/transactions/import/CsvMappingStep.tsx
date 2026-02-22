import { Button } from "@/components/ui/button";
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
  return (
    <div className="space-y-4">
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
            onMappingChange({ ...mapping, amountColumn: Number(value) })
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
            onMappingChange({ ...mapping, descriptionColumn: Number(value) })
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
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!isMappingValid}>
          Next
        </Button>
      </div>
    </div>
  );
}

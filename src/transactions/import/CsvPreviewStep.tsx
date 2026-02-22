import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { CsvParseResult } from "./CsvParseResult.type";

type CsvPreviewStepProps = {
  parseResult: CsvParseResult;
  onBack: () => void;
  onImport: () => void;
};

export function CsvPreviewStep({
  parseResult,
  onBack,
  onImport,
}: CsvPreviewStepProps) {
  const hasValidTransactions = parseResult.transactions.length > 0;

  return (
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

      {hasValidTransactions && (
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
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onImport} disabled={!hasValidTransactions}>
          Import
        </Button>
      </div>
    </div>
  );
}

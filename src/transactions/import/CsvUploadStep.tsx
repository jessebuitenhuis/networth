import { Upload } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";

type CsvUploadStepProps = {
  fileError: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function CsvUploadStep({ fileError, onFileChange }: CsvUploadStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div className="mt-2">
        <label className="text-sm font-medium mb-2 block">
          Select CSV file
        </label>
        <input
          ref={inputRef}
          data-testid="csv-file-input"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={onFileChange}
        />
        <Button
          variant="outline"
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          Choose file
        </Button>
      </div>
      {fileError && (
        <div className="text-sm text-red-600">{fileError}</div>
      )}
    </div>
  );
}

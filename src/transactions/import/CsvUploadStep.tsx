import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CsvUploadStepProps = {
  fileError: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function CsvUploadStep({ fileError, onFileChange }: CsvUploadStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="csv-file">Select CSV file</Label>
        <Input
          id="csv-file"
          type="file"
          accept=".csv"
          onChange={onFileChange}
        />
      </div>
      {fileError && (
        <div className="text-sm text-red-600">{fileError}</div>
      )}
    </div>
  );
}

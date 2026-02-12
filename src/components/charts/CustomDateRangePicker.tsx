import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DateRange } from "@/models/DateRange.type";

type CustomDateRangePickerProps = {
  start: string;
  end: string;
  onChange: (range: DateRange) => void;
};

export function CustomDateRangePicker({
  start,
  end,
  onChange,
}: CustomDateRangePickerProps) {
  return (
    <div className="flex gap-4 items-end">
      <div className="space-y-1">
        <Label htmlFor="range-start">Start</Label>
        <Input
          id="range-start"
          type="date"
          value={start}
          onChange={(e) => onChange({ start: e.target.value, end })}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="range-end">End</Label>
        <Input
          id="range-end"
          type="date"
          value={end}
          onChange={(e) => onChange({ start, end: e.target.value })}
        />
      </div>
    </div>
  );
}

"use client";

import { ChartPeriod } from "@/charts/ChartPeriod";
import { Button } from "@/components/ui/button";

type PeriodPickerProps = {
  periods: ChartPeriod[];
  selected: ChartPeriod;
  onSelect: (period: ChartPeriod) => void;
};

export function PeriodPicker({ periods, selected, onSelect }: PeriodPickerProps) {
  return (
    <div className="flex gap-2">
      {periods.map((period) => (
        <Button
          key={period}
          variant={period === selected ? "default" : "outline"}
          size="sm"
          aria-pressed={period === selected}
          onClick={() => onSelect(period)}
        >
          {period}
        </Button>
      ))}
    </div>
  );
}

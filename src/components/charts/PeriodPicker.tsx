"use client";

import { Button } from "@/components/ui/button";
import { ChartPeriod } from "@/models/ChartPeriod";

const PERIODS = [ChartPeriod.Week, ChartPeriod.Month, ChartPeriod.Quarter, ChartPeriod.Year];

type PeriodPickerProps = {
  selected: ChartPeriod;
  onSelect: (period: ChartPeriod) => void;
};

export function PeriodPicker({ selected, onSelect }: PeriodPickerProps) {
  return (
    <div className="flex gap-2">
      {PERIODS.map((period) => (
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

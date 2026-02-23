"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { ChartPeriod } from "@/charts/ChartPeriod";
import { Button } from "@/components/ui/button";

type PeriodPickerProps = {
  periods: ChartPeriod[];
  selected: ChartPeriod;
  onSelect: (period: ChartPeriod) => void;
  onPrevious?: () => void;
  onNext?: () => void;
};

export function PeriodPicker({
  periods,
  selected,
  onSelect,
  onPrevious,
  onNext,
}: PeriodPickerProps) {
  const hasNavigation = onPrevious !== undefined && onNext !== undefined;

  return (
    <div className="flex gap-2 items-center">
      {hasNavigation && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          aria-label="Previous period"
          onClick={onPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
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
      {hasNavigation && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          aria-label="Next period"
          onClick={onNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

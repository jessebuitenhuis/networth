import { Button } from "@/components/ui/button";
import { ProjectionPeriod } from "@/models/ProjectionPeriod";

const PERIODS = [
  ProjectionPeriod.OneMonth,
  ProjectionPeriod.ThreeMonths,
  ProjectionPeriod.SixMonths,
  ProjectionPeriod.OneYear,
  ProjectionPeriod.Custom,
];

type ProjectionPeriodPickerProps = {
  selected: ProjectionPeriod;
  onSelect: (period: ProjectionPeriod) => void;
};

export function ProjectionPeriodPicker({
  selected,
  onSelect,
}: ProjectionPeriodPickerProps) {
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

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getScenarioColor } from "@/lib/chartColors";
import type { Scenario } from "@/models/Scenario.type";

interface ScenarioChartPickerProps {
  scenarios: Scenario[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}

export function ScenarioChartPicker({
  scenarios,
  selectedIds,
  onToggle,
}: ScenarioChartPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          Scenarios ({selectedIds.size})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Checkbox id="baseline" checked disabled aria-label="Baseline" />
            <Label htmlFor="baseline" className="cursor-not-allowed opacity-50">
              Baseline
            </Label>
          </div>
          {scenarios.map((scenario, index) => {
            const isChecked = selectedIds.has(scenario.id);
            const color = getScenarioColor(index);
            return (
              <div key={scenario.id} className="flex items-center gap-2">
                <Checkbox
                  id={scenario.id}
                  checked={isChecked}
                  onCheckedChange={() => onToggle(scenario.id)}
                  aria-label={scenario.name}
                />
                <div
                  data-testid="scenario-color-dot"
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <Label htmlFor={scenario.id} className="cursor-pointer">
                  {scenario.name}
                </Label>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

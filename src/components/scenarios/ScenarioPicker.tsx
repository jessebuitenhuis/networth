import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Scenario } from "@/models/Scenario.type";

type ScenarioPickerProps = {
  scenarios: Scenario[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onClearAll?: () => void;
  renderActions?: (scenario: Scenario) => ReactNode;
};

export function ScenarioPicker({
  scenarios,
  selectedIds,
  onToggle,
  onClearAll,
  renderActions,
}: ScenarioPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          Scenarios ({selectedIds.size})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          {scenarios.map((scenario) => {
            const isChecked = selectedIds.has(scenario.id);
            return (
              <div key={scenario.id} className="group flex items-center gap-2 min-h-8">
                <Checkbox
                  id={scenario.id}
                  checked={isChecked}
                  onCheckedChange={() => onToggle(scenario.id)}
                  aria-label={scenario.name}
                />
                <Label htmlFor={scenario.id} className="cursor-pointer flex-1">
                  {scenario.name}
                </Label>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  {renderActions?.(scenario)}
                </div>
              </div>
            );
          })}
          {selectedIds.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-8 px-2"
              onClick={onClearAll}
            >
              Deselect all
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

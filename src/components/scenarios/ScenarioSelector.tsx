import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Scenario } from "@/models/Scenario.type";

type ScenarioSelectorProps = {
  scenarios: Scenario[];
  activeScenarioId: string | null;
  onSelect: (scenarioId: string | null) => void;
};

const BASELINE_SENTINEL = "__baseline__";

export function ScenarioSelector({
  scenarios,
  activeScenarioId,
  onSelect,
}: ScenarioSelectorProps) {
  const activeScenario = scenarios.find((s) => s.id === activeScenarioId);
  const displayValue = activeScenarioId === null ? "Baseline only" : activeScenario?.name;
  const selectValue = activeScenarioId ?? BASELINE_SENTINEL;

  function handleValueChange(value: string) {
    onSelect(value === BASELINE_SENTINEL ? null : value);
  }

  return (
    <Select value={selectValue} onValueChange={handleValueChange}>
      <SelectTrigger className="w-[200px]" aria-label="Scenario">
        <SelectValue placeholder="Select scenario">
          {displayValue}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={BASELINE_SENTINEL}>Baseline only</SelectItem>
        {scenarios.map((scenario) => (
          <SelectItem key={scenario.id} value={scenario.id}>
            {scenario.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

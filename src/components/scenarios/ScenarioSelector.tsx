import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Scenario } from "@/models/Scenario";

type ScenarioSelectorProps = {
  scenarios: Scenario[];
  activeScenarioId: string | null;
  onSelect: (scenarioId: string) => void;
};

export function ScenarioSelector({
  scenarios,
  activeScenarioId,
  onSelect,
}: ScenarioSelectorProps) {
  const activeScenario = scenarios.find((s) => s.id === activeScenarioId);

  return (
    <Select value={activeScenarioId ?? undefined} onValueChange={onSelect}>
      <SelectTrigger className="w-[200px]" aria-label="Scenario">
        <SelectValue placeholder="Select scenario">
          {activeScenario?.name}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {scenarios.map((scenario) => (
          <SelectItem key={scenario.id} value={scenario.id}>
            {scenario.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

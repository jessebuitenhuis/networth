"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Scenario } from "@/scenarios/Scenario.type";

interface ScenarioFilterSelectProps {
  scenarios: Scenario[];
  value: string | null;
  onValueChange: (id: string | null) => void;
}

const BASELINE_SENTINEL = "__baseline__";

export function ScenarioFilterSelect({
  scenarios,
  value,
  onValueChange,
}: ScenarioFilterSelectProps) {
  const _handleValueChange = (newValue: string) => {
    if (newValue === BASELINE_SENTINEL) {
      onValueChange(null);
    } else {
      onValueChange(newValue);
    }
  };

  const selectValue = value === null ? BASELINE_SENTINEL : value;

  return (
    <Select value={selectValue} onValueChange={_handleValueChange}>
      <SelectTrigger size="sm" aria-label="Scenario filter">
        <SelectValue />
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

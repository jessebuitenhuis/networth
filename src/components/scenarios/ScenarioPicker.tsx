import type { ReactNode } from "react";
import { useCallback, useMemo } from "react";

import {
  MultiSelectPicker,
  type MultiSelectPickerItem,
} from "@/components/shared/MultiSelectPicker";
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
  const items = useMemo(
    () => scenarios.map((s) => ({ id: s.id, label: s.name })),
    [scenarios]
  );

  const scenarioMap = useMemo(() => {
    const map = new Map<string, Scenario>();
    for (const s of scenarios) map.set(s.id, s);
    return map;
  }, [scenarios]);

  const wrappedRenderActions = useCallback(
    (item: MultiSelectPickerItem): ReactNode => {
      const scenario = scenarioMap.get(item.id);
      return scenario ? renderActions?.(scenario) : null;
    },
    [scenarioMap, renderActions]
  );

  return (
    <MultiSelectPicker
      label="Scenarios"
      items={items}
      selectedIds={selectedIds}
      onToggle={onToggle}
      onClearAll={onClearAll}
      renderActions={renderActions ? wrappedRenderActions : undefined}
      popoverWidth="w-80"
    />
  );
}

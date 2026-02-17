export function filterTransactionsByScenario<T extends { scenarioId?: string }>(
  items: T[],
  activeScenarioId: string | null
): T[] {
  if (activeScenarioId === null) {
    return items.filter((item) => !item.scenarioId);
  }

  return items.filter((item) => !item.scenarioId || item.scenarioId === activeScenarioId);
}

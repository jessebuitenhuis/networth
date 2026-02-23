interface DeleteScenarioDeps {
  removeTransactionsByScenarioId: (scenarioId: string) => void;
  removeRecurringTransactionsByScenarioId: (scenarioId: string) => void;
  removeScenario: (scenarioId: string) => void;
}

export function deleteScenarioCascade(
  scenarioId: string,
  deps: DeleteScenarioDeps,
): void {
  deps.removeTransactionsByScenarioId(scenarioId);
  deps.removeRecurringTransactionsByScenarioId(scenarioId);
  deps.removeScenario(scenarioId);
}

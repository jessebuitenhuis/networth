import { generateId } from "@/lib/generateId";
import type { RecurringTransaction } from "@/recurring-transactions/RecurringTransaction.type";
import type { Scenario } from "@/scenarios/Scenario.type";
import type { Transaction } from "@/transactions/Transaction.type";

interface DuplicateScenarioDeps {
  addScenario: (scenario: Scenario) => void;
  addTransaction: (transaction: Transaction) => void;
  addRecurringTransaction: (rt: RecurringTransaction) => void;
}

export function duplicateScenario(
  sourceScenario: Scenario,
  newName: string,
  transactions: Transaction[],
  recurringTransactions: RecurringTransaction[],
  deps: DuplicateScenarioDeps,
): string {
  const newScenarioId = generateId();

  deps.addScenario({
    id: newScenarioId,
    name: newName,
    inflationRate: sourceScenario.inflationRate,
  });

  transactions
    .filter((t) => t.scenarioId === sourceScenario.id)
    .forEach((t) => {
      deps.addTransaction({ ...t, id: generateId(), scenarioId: newScenarioId });
    });

  recurringTransactions
    .filter((rt) => rt.scenarioId === sourceScenario.id)
    .forEach((rt) => {
      deps.addRecurringTransaction({ ...rt, id: generateId(), scenarioId: newScenarioId });
    });

  return newScenarioId;
}

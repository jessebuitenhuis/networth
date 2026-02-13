import { describe, expect, it } from "vitest";

import { filterTransactionsByScenario } from "./filterTransactionsByScenario";

describe("filterTransactionsByScenario", () => {
  it.each([
    {
      name: "null activeScenarioId returns only baseline items (no scenarioId)",
      items: [
        { id: "1", name: "baseline" },
        { id: "2", name: "scenario", scenarioId: "s1" },
        { id: "3", name: "baseline2" },
      ],
      activeScenarioId: null,
      expected: [
        { id: "1", name: "baseline" },
        { id: "3", name: "baseline2" },
      ],
    },
    {
      name: "null activeScenarioId with mixed items returns only baseline",
      items: [
        { id: "1", name: "baseline", amount: 100 },
        { id: "2", name: "scenario1", scenarioId: "s1", amount: 200 },
        { id: "3", name: "scenario2", scenarioId: "s2", amount: 300 },
      ],
      activeScenarioId: null,
      expected: [{ id: "1", name: "baseline", amount: 100 }],
    },
    {
      name: "string activeScenarioId returns baseline + matching scenario items",
      items: [
        { id: "1", name: "baseline" },
        { id: "2", name: "scenario1", scenarioId: "s1" },
        { id: "3", name: "scenario2", scenarioId: "s2" },
        { id: "4", name: "baseline2" },
      ],
      activeScenarioId: "s1",
      expected: [
        { id: "1", name: "baseline" },
        { id: "2", name: "scenario1", scenarioId: "s1" },
        { id: "4", name: "baseline2" },
      ],
    },
    {
      name: "empty array returns empty array",
      items: [],
      activeScenarioId: "s1",
      expected: [],
    },
    {
      name: "no matches for scenario ID returns only baseline",
      items: [
        { id: "1", name: "baseline" },
        { id: "2", name: "scenario1", scenarioId: "s1" },
      ],
      activeScenarioId: "s2",
      expected: [{ id: "1", name: "baseline" }],
    },
    {
      name: "null activeScenarioId with all scenario items returns empty",
      items: [
        { id: "1", name: "scenario1", scenarioId: "s1" },
        { id: "2", name: "scenario2", scenarioId: "s2" },
      ],
      activeScenarioId: null,
      expected: [],
    },
  ])(
    "$name",
    ({ items, activeScenarioId, expected }: { items: unknown[]; activeScenarioId: string | null; expected: unknown[] }) => {
      const result = filterTransactionsByScenario(items, activeScenarioId);
      expect(result).toEqual(expected);
    }
  );
});

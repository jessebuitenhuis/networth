import { describe, it, expect, beforeEach } from "vitest";
import { ScenarioStorage } from "./ScenarioStorage";
import type { Scenario } from "@/models/Scenario";

describe("ScenarioStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("loadScenarios", () => {
    it("returns empty array when no data exists", () => {
      const scenarios = ScenarioStorage.loadScenarios();
      expect(scenarios).toEqual([]);
    });

    it("loads scenarios from localStorage", () => {
      const scenarios: Scenario[] = [
        { id: "1", name: "Base Plan" },
        { id: "2", name: "Optimistic" },
      ];
      localStorage.setItem("scenarios", JSON.stringify(scenarios));

      const loaded = ScenarioStorage.loadScenarios();
      expect(loaded).toEqual(scenarios);
    });

    it("returns empty array when data is invalid JSON", () => {
      localStorage.setItem("scenarios", "invalid-json");
      const scenarios = ScenarioStorage.loadScenarios();
      expect(scenarios).toEqual([]);
    });

    it("returns empty array when data is not an array", () => {
      localStorage.setItem("scenarios", JSON.stringify({ id: "1" }));
      const scenarios = ScenarioStorage.loadScenarios();
      expect(scenarios).toEqual([]);
    });
  });

  describe("saveScenarios", () => {
    it("saves scenarios to localStorage", () => {
      const scenarios: Scenario[] = [
        { id: "1", name: "Base Plan" },
        { id: "2", name: "Conservative" },
      ];

      ScenarioStorage.saveScenarios(scenarios);

      const stored = localStorage.getItem("scenarios");
      expect(stored).toBe(JSON.stringify(scenarios));
    });

    it("overwrites existing scenarios", () => {
      localStorage.setItem("scenarios", JSON.stringify([{ id: "old", name: "Old" }]));

      const newScenarios: Scenario[] = [{ id: "new", name: "New" }];
      ScenarioStorage.saveScenarios(newScenarios);

      const stored = localStorage.getItem("scenarios");
      expect(stored).toBe(JSON.stringify(newScenarios));
    });
  });

  describe("loadActiveScenarioId", () => {
    it("returns null when no active scenario is set", () => {
      const activeId = ScenarioStorage.loadActiveScenarioId();
      expect(activeId).toBeNull();
    });

    it("loads active scenario ID from localStorage", () => {
      localStorage.setItem("activeScenarioId", "scenario-123");

      const activeId = ScenarioStorage.loadActiveScenarioId();
      expect(activeId).toBe("scenario-123");
    });

    it("returns null when data is empty string", () => {
      localStorage.setItem("activeScenarioId", "");
      const activeId = ScenarioStorage.loadActiveScenarioId();
      expect(activeId).toBeNull();
    });
  });

  describe("saveActiveScenarioId", () => {
    it("saves active scenario ID to localStorage", () => {
      ScenarioStorage.saveActiveScenarioId("scenario-456");

      const stored = localStorage.getItem("activeScenarioId");
      expect(stored).toBe("scenario-456");
    });

    it("overwrites existing active scenario ID", () => {
      localStorage.setItem("activeScenarioId", "old-id");

      ScenarioStorage.saveActiveScenarioId("new-id");

      const stored = localStorage.getItem("activeScenarioId");
      expect(stored).toBe("new-id");
    });

    it("removes activeScenarioId when null is passed", () => {
      localStorage.setItem("activeScenarioId", "some-id");

      ScenarioStorage.saveActiveScenarioId(null);

      const stored = localStorage.getItem("activeScenarioId");
      expect(stored).toBeNull();
    });
  });
});

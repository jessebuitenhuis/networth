import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ScenarioProvider, useScenarios } from "./ScenarioContext";
import { ScenarioStorage } from "@/services/ScenarioStorage";
import type { Scenario } from "@/models/Scenario";

vi.mock("@/services/ScenarioStorage");

describe("ScenarioContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("reducer", () => {
    it("adds a scenario", () => {
      vi.mocked(ScenarioStorage.loadScenarios).mockReturnValue([]);
      vi.mocked(ScenarioStorage.loadActiveScenarioId).mockReturnValue(null);

      const { result } = renderHook(() => useScenarios(), {
        wrapper: ScenarioProvider,
      });

      act(() => {
        result.current.addScenario({ id: "1", name: "Test" });
      });

      expect(result.current.scenarios).toContainEqual({ id: "1", name: "Test" });
    });

    it("removes a scenario", () => {
      const initial: Scenario[] = [
        { id: "1", name: "First" },
        { id: "2", name: "Second" },
      ];
      vi.mocked(ScenarioStorage.loadScenarios).mockReturnValue(initial);
      vi.mocked(ScenarioStorage.loadActiveScenarioId).mockReturnValue("1");

      const { result } = renderHook(() => useScenarios(), {
        wrapper: ScenarioProvider,
      });

      act(() => {
        result.current.removeScenario("1");
      });

      expect(result.current.scenarios).toEqual([{ id: "2", name: "Second" }]);
    });

    it("updates a scenario name", () => {
      const initial: Scenario[] = [{ id: "1", name: "Original" }];
      vi.mocked(ScenarioStorage.loadScenarios).mockReturnValue(initial);
      vi.mocked(ScenarioStorage.loadActiveScenarioId).mockReturnValue("1");

      const { result } = renderHook(() => useScenarios(), {
        wrapper: ScenarioProvider,
      });

      act(() => {
        result.current.updateScenario("1", "Updated");
      });

      expect(result.current.scenarios).toEqual([{ id: "1", name: "Updated" }]);
    });

    it("sets active scenario", () => {
      const initial: Scenario[] = [
        { id: "1", name: "First" },
        { id: "2", name: "Second" },
      ];
      vi.mocked(ScenarioStorage.loadScenarios).mockReturnValue(initial);
      vi.mocked(ScenarioStorage.loadActiveScenarioId).mockReturnValue("1");

      const { result } = renderHook(() => useScenarios(), {
        wrapper: ScenarioProvider,
      });

      act(() => {
        result.current.setActiveScenario("2");
      });

      expect(result.current.activeScenarioId).toBe("2");
    });

    it("sets all scenarios", () => {
      vi.mocked(ScenarioStorage.loadScenarios).mockReturnValue([]);
      vi.mocked(ScenarioStorage.loadActiveScenarioId).mockReturnValue(null);

      const { result } = renderHook(() => useScenarios(), {
        wrapper: ScenarioProvider,
      });

      const newScenarios: Scenario[] = [
        { id: "1", name: "One" },
        { id: "2", name: "Two" },
      ];

      act(() => {
        result.current.setScenarios(newScenarios);
      });

      expect(result.current.scenarios).toEqual(newScenarios);
    });
  });

  describe("provider", () => {
    it("creates Base Plan when no scenarios exist", () => {
      vi.mocked(ScenarioStorage.loadScenarios).mockReturnValue([]);
      vi.mocked(ScenarioStorage.loadActiveScenarioId).mockReturnValue(null);

      const { result } = renderHook(() => useScenarios(), {
        wrapper: ScenarioProvider,
      });

      expect(result.current.scenarios).toHaveLength(1);
      expect(result.current.scenarios[0].name).toBe("Base Plan");
      expect(result.current.scenarios[0].id).toBeDefined();
      expect(result.current.activeScenarioId).toBe(
        result.current.scenarios[0].id
      );
    });

    it("loads existing scenarios from storage", () => {
      const existing: Scenario[] = [
        { id: "1", name: "Saved" },
        { id: "2", name: "Another" },
      ];
      vi.mocked(ScenarioStorage.loadScenarios).mockReturnValue(existing);
      vi.mocked(ScenarioStorage.loadActiveScenarioId).mockReturnValue("1");

      const { result } = renderHook(() => useScenarios(), {
        wrapper: ScenarioProvider,
      });

      expect(result.current.scenarios).toEqual(existing);
      expect(result.current.activeScenarioId).toBe("1");
    });

    it("persists scenarios when added", () => {
      vi.mocked(ScenarioStorage.loadScenarios).mockReturnValue([]);
      vi.mocked(ScenarioStorage.loadActiveScenarioId).mockReturnValue(null);

      const { result } = renderHook(() => useScenarios(), {
        wrapper: ScenarioProvider,
      });

      act(() => {
        result.current.addScenario({ id: "new", name: "New" });
      });

      expect(ScenarioStorage.saveScenarios).toHaveBeenCalled();
    });

    it("persists active scenario when changed", () => {
      const initial: Scenario[] = [
        { id: "1", name: "First" },
        { id: "2", name: "Second" },
      ];
      vi.mocked(ScenarioStorage.loadScenarios).mockReturnValue(initial);
      vi.mocked(ScenarioStorage.loadActiveScenarioId).mockReturnValue("1");

      const { result } = renderHook(() => useScenarios(), {
        wrapper: ScenarioProvider,
      });

      act(() => {
        result.current.setActiveScenario("2");
      });

      expect(ScenarioStorage.saveActiveScenarioId).toHaveBeenCalledWith("2");
    });

    it("throws error when used outside provider", () => {
      expect(() => renderHook(() => useScenarios())).toThrow(
        "useScenarios must be used within ScenarioProvider"
      );
    });
  });
});

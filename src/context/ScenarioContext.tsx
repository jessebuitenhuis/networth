"use client";

import { createContext, useContext, useEffect, useReducer } from "react";

import { generateId } from "@/lib/generateId";
import type { Scenario } from "@/models/Scenario.type";
import { ScenarioStorage } from "@/services/ScenarioStorage";

type ScenarioState = {
  scenarios: Scenario[];
  activeScenarioId: string | null;
};

export type ScenarioAction =
  | { type: "add"; scenario: Scenario }
  | { type: "remove"; id: string }
  | { type: "update"; id: string; name: string }
  | { type: "setActive"; id: string | null }
  | { type: "set"; scenarios: Scenario[]; activeScenarioId: string | null };

export function scenarioReducer(
  state: ScenarioState,
  action: ScenarioAction
): ScenarioState {
  switch (action.type) {
    case "add":
      return {
        ...state,
        scenarios: [...state.scenarios, action.scenario],
      };
    case "remove":
      return {
        ...state,
        scenarios: state.scenarios.filter((s) => s.id !== action.id),
      };
    case "update":
      return {
        ...state,
        scenarios: state.scenarios.map((s) =>
          s.id === action.id ? { ...s, name: action.name } : s
        ),
      };
    case "setActive":
      return {
        ...state,
        activeScenarioId: action.id,
      };
    case "set":
      return {
        scenarios: action.scenarios,
        activeScenarioId: action.activeScenarioId,
      };
  }
}

type ScenarioContextValue = {
  scenarios: Scenario[];
  activeScenarioId: string | null;
  addScenario: (scenario: Scenario) => void;
  removeScenario: (id: string) => void;
  updateScenario: (id: string, name: string) => void;
  setActiveScenario: (id: string | null) => void;
  setScenarios: (scenarios: Scenario[]) => void;
};

const ScenarioContext = createContext<ScenarioContextValue | null>(null);

export function ScenarioProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(scenarioReducer, {
    scenarios: [],
    activeScenarioId: null,
  });

  useEffect(() => {
    const loadedScenarios = ScenarioStorage.loadScenarios();
    const loadedActiveId = ScenarioStorage.loadActiveScenarioId();

    if (loadedScenarios.length === 0) {
      const basePlan: Scenario = {
        id: generateId(),
        name: "Base Plan",
      };
      dispatch({
        type: "set",
        scenarios: [basePlan],
        activeScenarioId: null,
      });
      ScenarioStorage.saveScenarios([basePlan]);
      ScenarioStorage.saveActiveScenarioId(null);
    } else {
      dispatch({
        type: "set",
        scenarios: loadedScenarios,
        activeScenarioId: loadedActiveId,
      });
    }
  }, []);

  useEffect(() => {
    if (state.scenarios.length > 0) {
      ScenarioStorage.saveScenarios(state.scenarios);
    }
  }, [state.scenarios]);

  useEffect(() => {
    ScenarioStorage.saveActiveScenarioId(state.activeScenarioId);
  }, [state.activeScenarioId]);

  function addScenario(scenario: Scenario) {
    dispatch({ type: "add", scenario });
  }

  function removeScenario(id: string) {
    dispatch({ type: "remove", id });
  }

  function updateScenario(id: string, name: string) {
    dispatch({ type: "update", id, name });
  }

  function setActiveScenario(id: string | null) {
    dispatch({ type: "setActive", id });
  }

  function setScenarios(scenarios: Scenario[]) {
    dispatch({
      type: "set",
      scenarios,
      activeScenarioId: state.activeScenarioId,
    });
  }

  return (
    <ScenarioContext
      value={{
        scenarios: state.scenarios,
        activeScenarioId: state.activeScenarioId,
        addScenario,
        removeScenario,
        updateScenario,
        setActiveScenario,
        setScenarios,
      }}
    >
      {children}
    </ScenarioContext>
  );
}

export function useScenarios(): ScenarioContextValue {
  const ctx = useContext(ScenarioContext);
  if (!ctx) {
    throw new Error("useScenarios must be used within ScenarioProvider");
  }
  return ctx;
}

"use client";

import { createContext, useContext, useEffect, useReducer } from "react";

import type { Scenario } from "./Scenario.type";

type ScenarioState = {
  scenarios: Scenario[];
  activeScenarioId: string | null;
};

export type ScenarioAction =
  | { type: "add"; scenario: Scenario }
  | { type: "remove"; id: string }
  | { type: "update"; id: string; name: string; inflationRate?: number }
  | { type: "setActive"; id: string | null }
  | { type: "init"; scenarios: Scenario[]; activeScenarioId: string | null };

export function scenarioReducer(
  state: ScenarioState,
  action: ScenarioAction,
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
          s.id === action.id ? { ...s, name: action.name, inflationRate: action.inflationRate } : s,
        ),
      };
    case "setActive":
      return {
        ...state,
        activeScenarioId: action.id,
      };
    case "init":
      return {
        scenarios: action.scenarios,
        activeScenarioId: action.activeScenarioId,
      };
  }
}

type ScenarioContextValue = {
  scenarios: Scenario[];
  activeScenarioId: string | null;
  addScenario: (scenario: Scenario) => Promise<void>;
  removeScenario: (id: string) => Promise<void>;
  updateScenario: (id: string, name: string, inflationRate?: number) => Promise<void>;
  setActiveScenario: (id: string | null) => Promise<void>;
};

const ScenarioContext = createContext<ScenarioContextValue | null>(null);

export function ScenarioProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(scenarioReducer, {
    scenarios: [],
    activeScenarioId: null,
  });

  useEffect(() => {
    fetch("/api/scenarios")
      .then((res) => res.json())
      .then((data) =>
        dispatch({
          type: "init",
          scenarios: data.scenarios,
          activeScenarioId: data.activeScenarioId,
        }),
      );
  }, []);

  async function addScenario(scenario: Scenario) {
    await fetch("/api/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scenario),
    });
    dispatch({ type: "add", scenario });
  }

  async function removeScenario(id: string) {
    await fetch(`/api/scenarios/${id}`, { method: "DELETE" });
    dispatch({ type: "remove", id });
  }

  async function updateScenario(id: string, name: string, inflationRate?: number) {
    await fetch(`/api/scenarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, inflationRate }),
    });
    dispatch({ type: "update", id, name, inflationRate });
  }

  async function setActiveScenario(id: string | null) {
    await fetch("/api/scenarios/active", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenarioId: id }),
    });
    dispatch({ type: "setActive", id });
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

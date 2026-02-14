"use client";

import { createContext, useContext, useEffect, useReducer } from "react";

import type { Goal } from "./Goal.type";
import { loadGoals, saveGoals } from "./GoalStorage";

export type GoalAction =
  | { type: "add"; goal: Goal }
  | { type: "remove"; id: string }
  | { type: "update"; goal: Goal }
  | { type: "set"; goals: Goal[] };

export function goalReducer(state: Goal[], action: GoalAction): Goal[] {
  switch (action.type) {
    case "add":
      return [...state, action.goal];
    case "remove":
      return state.filter((g) => g.id !== action.id);
    case "update":
      return state.map((g) => (g.id === action.goal.id ? action.goal : g));
    case "set":
      return action.goals;
  }
}

type GoalContextValue = {
  goals: Goal[];
  addGoal: (goal: Goal) => void;
  removeGoal: (id: string) => void;
  updateGoal: (goal: Goal) => void;
};

const GoalContext = createContext<GoalContextValue | null>(null);

export function GoalProvider({ children }: { children: React.ReactNode }) {
  const [goals, dispatch] = useReducer(goalReducer, []);

  useEffect(() => {
    dispatch({ type: "set", goals: loadGoals() });
  }, []);

  useEffect(() => {
    saveGoals(goals);
  }, [goals]);

  function addGoal(goal: Goal) {
    dispatch({ type: "add", goal });
  }

  function removeGoal(id: string) {
    dispatch({ type: "remove", id });
  }

  function updateGoal(goal: Goal) {
    dispatch({ type: "update", goal });
  }

  return (
    <GoalContext value={{ goals, addGoal, removeGoal, updateGoal }}>
      {children}
    </GoalContext>
  );
}

export function useGoals(): GoalContextValue {
  const ctx = useContext(GoalContext);
  if (!ctx) {
    throw new Error("useGoals must be used within GoalProvider");
  }
  return ctx;
}

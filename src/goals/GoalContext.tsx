"use client";

import { createContext, useContext, useEffect, useReducer } from "react";

import type { Goal } from "./Goal.type";

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
  addGoal: (goal: Goal) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
};

const GoalContext = createContext<GoalContextValue | null>(null);

export function GoalProvider({ children }: { children: React.ReactNode }) {
  const [goals, dispatch] = useReducer(goalReducer, []);

  useEffect(() => {
    fetch("/api/goals")
      .then((res) => res.json())
      .then((data) => dispatch({ type: "set", goals: data }));
  }, []);

  async function addGoal(goal: Goal) {
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(goal),
    });
    dispatch({ type: "add", goal });
  }

  async function removeGoal(id: string) {
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    dispatch({ type: "remove", id });
  }

  async function updateGoal(goal: Goal) {
    await fetch(`/api/goals/${goal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(goal),
    });
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

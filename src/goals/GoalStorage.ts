import type { Goal } from "./Goal.type";

const STORAGE_KEY = "goals";

export function loadGoals(): Goal[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Goal[];
  } catch {
    return [];
  }
}

export function saveGoals(goals: Goal[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

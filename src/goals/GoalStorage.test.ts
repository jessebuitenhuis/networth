import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Goal } from "./Goal.type";
import { loadGoals, saveGoals } from "./GoalStorage";

describe("GoalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("loadGoals", () => {
    it("returns empty array when nothing is stored", () => {
      expect(loadGoals()).toEqual([]);
    });

    it("returns stored goals", () => {
      const goals: Goal[] = [
        { id: "1", name: "Emergency Fund", targetAmount: 10000 },
      ];
      localStorage.setItem("goals", JSON.stringify(goals));

      expect(loadGoals()).toEqual(goals);
    });

    it("returns empty array when stored data is invalid JSON", () => {
      localStorage.setItem("goals", "not-json");

      expect(loadGoals()).toEqual([]);
    });

    it("returns empty array on server side (window undefined)", () => {
      const originalWindow = global.window;
      vi.stubGlobal("window", undefined);

      expect(loadGoals()).toEqual([]);

      vi.stubGlobal("window", originalWindow);
    });
  });

  describe("saveGoals", () => {
    it("persists goals to localStorage", () => {
      const goals: Goal[] = [
        { id: "1", name: "FIRE Goal", targetAmount: 500000 },
      ];

      saveGoals(goals);

      expect(JSON.parse(localStorage.getItem("goals")!)).toEqual(goals);
    });

    it("overwrites previously stored goals", () => {
      const first: Goal[] = [{ id: "1", name: "Old Goal", targetAmount: 1000 }];
      const second: Goal[] = [
        { id: "2", name: "New Goal", targetAmount: 2000 },
      ];

      saveGoals(first);
      saveGoals(second);

      expect(JSON.parse(localStorage.getItem("goals")!)).toEqual(second);
    });

    it("does nothing on server side (window undefined)", () => {
      const originalWindow = global.window;
      vi.stubGlobal("window", undefined);

      const goals: Goal[] = [
        { id: "1", name: "Test Goal", targetAmount: 1000 },
      ];
      saveGoals(goals);

      expect(localStorage.getItem("goals")).toBeNull();

      vi.stubGlobal("window", originalWindow);
    });
  });
});

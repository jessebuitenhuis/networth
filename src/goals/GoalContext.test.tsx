import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Goal } from "./Goal.type";
import { GoalProvider, goalReducer, useGoals } from "./GoalContext";

const goal1: Goal = {
  id: "1",
  name: "Emergency Fund",
  targetAmount: 10000,
};

const goal2: Goal = {
  id: "2",
  name: "FIRE",
  targetAmount: 500000,
};

const updatedGoal: Goal = {
  id: "1",
  name: "Emergency Fund (Updated)",
  targetAmount: 15000,
};

describe("goalReducer", () => {
  it("adds a goal", () => {
    const result = goalReducer([], { type: "add", goal: goal1 });
    expect(result).toEqual([goal1]);
  });

  it("removes a goal by id", () => {
    const result = goalReducer([goal1, goal2], {
      type: "remove",
      id: "1",
    });
    expect(result).toEqual([goal2]);
  });

  it("sets goals list", () => {
    const goals = [goal1, goal2];
    const result = goalReducer([], { type: "set", goals });
    expect(result).toEqual(goals);
  });

  it("updates a goal by id", () => {
    const result = goalReducer([goal1, goal2], {
      type: "update",
      goal: updatedGoal,
    });
    expect(result).toEqual([updatedGoal, goal2]);
  });
});

function TestConsumer() {
  const { goals, addGoal, removeGoal, updateGoal } = useGoals();
  return (
    <div>
      <span data-testid="count">{goals.length}</span>
      <button onClick={() => addGoal(goal1)}>Add</button>
      <button onClick={() => removeGoal("1")}>Remove</button>
      <button onClick={() => updateGoal(updatedGoal)}>Update</button>
      {goals.map((g: Goal) => (
        <span key={g.id}>
          {g.name} - {g.targetAmount}
        </span>
      ))}
    </div>
  );
}

describe("GoalProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts with empty goals", () => {
    render(
      <GoalProvider>
        <TestConsumer />
      </GoalProvider>
    );
    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("loads goals from localStorage on mount", async () => {
    localStorage.setItem("goals", JSON.stringify([goal1]));

    render(
      <GoalProvider>
        <TestConsumer />
      </GoalProvider>
    );

    expect(
      await screen.findByText("Emergency Fund - 10000")
    ).toBeInTheDocument();
  });

  it("adds a goal", () => {
    render(
      <GoalProvider>
        <TestConsumer />
      </GoalProvider>
    );

    act(() => screen.getByText("Add").click());

    expect(screen.getByText("Emergency Fund - 10000")).toBeInTheDocument();
    expect(screen.getByTestId("count")).toHaveTextContent("1");
  });

  it("removes a goal", () => {
    localStorage.setItem("goals", JSON.stringify([goal1]));

    render(
      <GoalProvider>
        <TestConsumer />
      </GoalProvider>
    );

    act(() => screen.getByText("Remove").click());

    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("persists goals to localStorage on change", () => {
    render(
      <GoalProvider>
        <TestConsumer />
      </GoalProvider>
    );

    act(() => screen.getByText("Add").click());

    const stored = JSON.parse(localStorage.getItem("goals")!);
    expect(stored).toEqual([goal1]);
  });

  it("updates a goal", () => {
    localStorage.setItem("goals", JSON.stringify([goal1, goal2]));

    render(
      <GoalProvider>
        <TestConsumer />
      </GoalProvider>
    );

    act(() => screen.getByText("Update").click());

    expect(
      screen.getByText("Emergency Fund (Updated) - 15000")
    ).toBeInTheDocument();
    expect(screen.getByText("FIRE - 500000")).toBeInTheDocument();
    expect(
      screen.queryByText("Emergency Fund - 10000")
    ).not.toBeInTheDocument();
  });

  it("throws when useGoals is called outside provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useGoals must be used within GoalProvider"
    );
    spy.mockRestore();
  });
});

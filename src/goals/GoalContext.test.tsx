import { act, render, screen, waitFor } from "@testing-library/react";
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

function mockFetchResponses(initialGoals: Goal[]) {
  vi.stubGlobal(
    "fetch",
    vi.fn((_url: string, options?: RequestInit) => {
      const method = options?.method ?? "GET";

      if (method === "GET") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([...initialGoals]),
        });
      }

      if (method === "POST") {
        const body = JSON.parse(options!.body as string);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(body),
        });
      }

      if (method === "PUT") {
        const body = JSON.parse(options!.body as string);
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(body),
        });
      }

      if (method === "DELETE") {
        return Promise.resolve({ ok: true, status: 204 });
      }

      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }),
  );
}

describe("GoalProvider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("starts with empty goals when API returns empty", async () => {
    mockFetchResponses([]);

    render(
      <GoalProvider>
        <TestConsumer />
      </GoalProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("count")).toHaveTextContent("0");
    });
  });

  it("loads goals from API on mount", async () => {
    mockFetchResponses([goal1]);

    render(
      <GoalProvider>
        <TestConsumer />
      </GoalProvider>,
    );

    expect(
      await screen.findByText("Emergency Fund - 10000"),
    ).toBeInTheDocument();
  });

  it("adds a goal via API", async () => {
    mockFetchResponses([]);

    render(
      <GoalProvider>
        <TestConsumer />
      </GoalProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("count")).toHaveTextContent("0");
    });

    await act(async () => screen.getByText("Add").click());

    await waitFor(() => {
      expect(
        screen.getByText("Emergency Fund - 10000"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("count")).toHaveTextContent("1");
    });
  });

  it("removes a goal via API", async () => {
    mockFetchResponses([{ ...goal1 }]);

    render(
      <GoalProvider>
        <TestConsumer />
      </GoalProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("count")).toHaveTextContent("1");
    });

    await act(async () => screen.getByText("Remove").click());

    await waitFor(() => {
      expect(screen.getByTestId("count")).toHaveTextContent("0");
    });
  });

  it("calls fetch with correct URL on mount", async () => {
    mockFetchResponses([]);

    render(
      <GoalProvider>
        <TestConsumer />
      </GoalProvider>,
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/goals");
    });
  });

  it("updates a goal via API", async () => {
    mockFetchResponses([{ ...goal1 }, { ...goal2 }]);

    render(
      <GoalProvider>
        <TestConsumer />
      </GoalProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("count")).toHaveTextContent("2");
    });

    await act(async () => screen.getByText("Update").click());

    await waitFor(() => {
      expect(
        screen.getByText("Emergency Fund (Updated) - 15000"),
      ).toBeInTheDocument();
      expect(screen.getByText("FIRE - 500000")).toBeInTheDocument();
      expect(
        screen.queryByText("Emergency Fund - 10000"),
      ).not.toBeInTheDocument();
    });
  });

  it("throws when useGoals is called outside provider", () => {
    mockFetchResponses([]);
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useGoals must be used within GoalProvider",
    );
    spy.mockRestore();
  });
});

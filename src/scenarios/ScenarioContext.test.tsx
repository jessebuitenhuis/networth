import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ScenarioProvider,
  scenarioReducer,
  useScenarios,
} from "@/context/ScenarioContext";
import type { Scenario } from "@/scenarios/Scenario.type";

const scenario1: Scenario = { id: "1", name: "Base Plan" };
const scenario2: Scenario = { id: "2", name: "Aggressive Savings" };

describe("scenarioReducer", () => {
  const initial: { scenarios: Scenario[]; activeScenarioId: string | null } = {
    scenarios: [scenario1],
    activeScenarioId: "1",
  };

  it("adds a scenario", () => {
    const result = scenarioReducer(initial, {
      type: "add",
      scenario: scenario2,
    });
    expect(result.scenarios).toEqual([scenario1, scenario2]);
  });

  it("removes a scenario", () => {
    const state = { scenarios: [scenario1, scenario2], activeScenarioId: "1" };
    const result = scenarioReducer(state, { type: "remove", id: "1" });
    expect(result.scenarios).toEqual([scenario2]);
  });

  it("updates a scenario name", () => {
    const result = scenarioReducer(initial, {
      type: "update",
      id: "1",
      name: "Updated",
    });
    expect(result.scenarios).toEqual([{ id: "1", name: "Updated" }]);
  });

  it("sets active scenario", () => {
    const result = scenarioReducer(initial, { type: "setActive", id: "2" });
    expect(result.activeScenarioId).toBe("2");
  });

  it("sets active scenario to null", () => {
    const result = scenarioReducer(initial, { type: "setActive", id: null });
    expect(result.activeScenarioId).toBe(null);
  });

  it("sets all scenarios", () => {
    const result = scenarioReducer(initial, {
      type: "set",
      scenarios: [scenario2],
      activeScenarioId: "2",
    });
    expect(result.scenarios).toEqual([scenario2]);
    expect(result.activeScenarioId).toBe("2");
  });
});

const mockFetch = vi.fn();

function TestConsumer() {
  const {
    scenarios,
    activeScenarioId,
    addScenario,
    removeScenario,
    updateScenario,
    setActiveScenario,
    setScenarios,
  } = useScenarios();
  return (
    <div>
      <span data-testid="count">{scenarios.length}</span>
      <span data-testid="active">{activeScenarioId ?? "none"}</span>
      <button onClick={() => addScenario(scenario2)}>Add</button>
      <button onClick={() => removeScenario("1")}>Remove</button>
      <button onClick={() => updateScenario("1", "Updated")}>Update</button>
      <button onClick={() => setActiveScenario("2")}>Set Active</button>
      <button onClick={() => setActiveScenario(null)}>Clear Active</button>
      <button onClick={() => setScenarios([scenario2])}>Set All</button>
      {scenarios.map((s) => (
        <span key={s.id}>{s.name}</span>
      ))}
    </div>
  );
}

describe("ScenarioProvider", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ scenarios: [], activeScenarioId: null }),
    });
  });

  it("fetches scenarios from API on mount", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        scenarios: [scenario1],
        activeScenarioId: "1",
      }),
    });

    render(
      <ScenarioProvider>
        <TestConsumer />
      </ScenarioProvider>,
    );

    expect(await screen.findByText("Base Plan")).toBeInTheDocument();
    expect(screen.getByTestId("active")).toHaveTextContent("1");
    expect(mockFetch).toHaveBeenCalledWith("/api/scenarios");
  });

  it("starts with empty scenarios before API responds", () => {
    mockFetch.mockReturnValue(new Promise(() => {}));

    render(
      <ScenarioProvider>
        <TestConsumer />
      </ScenarioProvider>,
    );

    expect(screen.getByTestId("count")).toHaveTextContent("0");
  });

  it("auto-creates Base Plan at API level when no scenarios exist", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        scenarios: [{ id: "auto-id", name: "Base Plan" }],
        activeScenarioId: "auto-id",
      }),
    });

    render(
      <ScenarioProvider>
        <TestConsumer />
      </ScenarioProvider>,
    );

    expect(await screen.findByText("Base Plan")).toBeInTheDocument();
    expect(screen.getByTestId("count")).toHaveTextContent("1");
  });

  it("calls POST /api/scenarios on add", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          scenarios: [scenario1],
          activeScenarioId: "1",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => scenario2,
      });

    render(
      <ScenarioProvider>
        <TestConsumer />
      </ScenarioProvider>,
    );

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith("/api/scenarios"),
    );

    await act(async () => screen.getByText("Add").click());

    expect(mockFetch).toHaveBeenCalledWith("/api/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scenario2),
    });
    expect(screen.getByText("Aggressive Savings")).toBeInTheDocument();
  });

  it("calls DELETE /api/scenarios/:id on remove", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          scenarios: [scenario1, scenario2],
          activeScenarioId: "1",
        }),
      })
      .mockResolvedValueOnce({ ok: true });

    render(
      <ScenarioProvider>
        <TestConsumer />
      </ScenarioProvider>,
    );

    await screen.findByText("Base Plan");

    await act(async () => screen.getByText("Remove").click());

    expect(mockFetch).toHaveBeenCalledWith("/api/scenarios/1", {
      method: "DELETE",
    });
    expect(screen.queryByText("Base Plan")).not.toBeInTheDocument();
    expect(screen.getByText("Aggressive Savings")).toBeInTheDocument();
  });

  it("calls PUT /api/scenarios/:id on update", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          scenarios: [scenario1],
          activeScenarioId: "1",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "1", name: "Updated" }),
      });

    render(
      <ScenarioProvider>
        <TestConsumer />
      </ScenarioProvider>,
    );

    await screen.findByText("Base Plan");

    await act(async () => screen.getByText("Update").click());

    expect(mockFetch).toHaveBeenCalledWith("/api/scenarios/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated" }),
    });
    expect(screen.getByText("Updated")).toBeInTheDocument();
    expect(screen.queryByText("Base Plan")).not.toBeInTheDocument();
  });

  it("calls PUT /api/scenarios/active on setActiveScenario", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          scenarios: [scenario1, scenario2],
          activeScenarioId: "1",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ activeScenarioId: "2" }),
      });

    render(
      <ScenarioProvider>
        <TestConsumer />
      </ScenarioProvider>,
    );

    await screen.findByText("Base Plan");

    await act(async () => screen.getByText("Set Active").click());

    expect(mockFetch).toHaveBeenCalledWith("/api/scenarios/active", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenarioId: "2" }),
    });
    expect(screen.getByTestId("active")).toHaveTextContent("2");
  });

  it("calls PUT /api/scenarios/active with null on clearActive", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          scenarios: [scenario1],
          activeScenarioId: "1",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ activeScenarioId: null }),
      });

    render(
      <ScenarioProvider>
        <TestConsumer />
      </ScenarioProvider>,
    );

    await screen.findByText("Base Plan");

    await act(async () => screen.getByText("Clear Active").click());

    expect(mockFetch).toHaveBeenCalledWith("/api/scenarios/active", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenarioId: null }),
    });
    expect(screen.getByTestId("active")).toHaveTextContent("none");
  });

  it("throws when useScenarios is called outside provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      "useScenarios must be used within ScenarioProvider",
    );
    spy.mockRestore();
  });
});

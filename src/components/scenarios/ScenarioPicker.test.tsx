import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ScenarioPicker } from "./ScenarioPicker";
import type { Scenario } from "@/models/Scenario.type";

const mockScenarios: Scenario[] = [
  { id: "scenario-1", name: "Optimistic" },
  { id: "scenario-2", name: "Pessimistic" },
  { id: "scenario-3", name: "Conservative" },
];

describe("ScenarioPicker", () => {
  it("renders button with 'Scenarios (N)' reflecting selected count", async () => {
    const selectedIds = new Set(["scenario-1", "scenario-2"]);
    render(
      <ScenarioPicker
        scenarios={mockScenarios}
        selectedIds={selectedIds}
        onToggle={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: "Scenarios (2)" })
    ).toBeInTheDocument();
  });

  it("shows 'Scenarios (0)' when none selected", () => {
    const selectedIds = new Set<string>();
    render(
      <ScenarioPicker
        scenarios={mockScenarios}
        selectedIds={selectedIds}
        onToggle={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: "Scenarios (0)" })
    ).toBeInTheDocument();
  });

  it("does not show 'Deselect all' button when no scenarios selected", async () => {
    const selectedIds = new Set<string>();
    render(
      <ScenarioPicker
        scenarios={mockScenarios}
        selectedIds={selectedIds}
        onToggle={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Scenarios (0)" }));

    expect(screen.queryByRole("button", { name: "Deselect all" })).not.toBeInTheDocument();
  });

  it("shows 'Deselect all' button when scenarios are selected", async () => {
    const selectedIds = new Set(["scenario-1"]);
    render(
      <ScenarioPicker
        scenarios={mockScenarios}
        selectedIds={selectedIds}
        onToggle={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Scenarios (1)" }));

    expect(screen.getByRole("button", { name: "Deselect all" })).toBeInTheDocument();
  });

  it("clicking 'Deselect all' calls onClearAll", async () => {
    const onClearAll = vi.fn();
    const selectedIds = new Set(["scenario-1"]);
    render(
      <ScenarioPicker
        scenarios={mockScenarios}
        selectedIds={selectedIds}
        onToggle={vi.fn()}
        onClearAll={onClearAll}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Scenarios (1)" }));
    await userEvent.click(screen.getByRole("button", { name: "Deselect all" }));

    expect(onClearAll).toHaveBeenCalled();
  });

  it("scenario checkboxes reflect selectedIds prop", async () => {
    const selectedIds = new Set(["scenario-1"]);
    render(
      <ScenarioPicker
        scenarios={mockScenarios}
        selectedIds={selectedIds}
        onToggle={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Scenarios (1)" }));

    expect(screen.getByRole("checkbox", { name: "Optimistic" })).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "Pessimistic" })
    ).not.toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: "Conservative" })
    ).not.toBeChecked();
  });

  it("clicking a scenario checkbox calls onToggle with correct id", async () => {
    const onToggle = vi.fn();
    const selectedIds = new Set<string>();
    render(
      <ScenarioPicker
        scenarios={mockScenarios}
        selectedIds={selectedIds}
        onToggle={onToggle}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Scenarios (0)" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Optimistic" }));

    expect(onToggle).toHaveBeenCalledWith("scenario-1");
  });

  it("renders action buttons via renderActions prop", async () => {
    const selectedIds = new Set<string>();
    const renderActions = (scenario: Scenario) => (
      <button data-testid={`action-${scenario.id}`}>Edit</button>
    );

    render(
      <ScenarioPicker
        scenarios={mockScenarios}
        selectedIds={selectedIds}
        onToggle={vi.fn()}
        renderActions={renderActions}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Scenarios (0)" }));

    expect(screen.getByTestId("action-scenario-1")).toHaveTextContent("Edit");
    expect(screen.getByTestId("action-scenario-2")).toHaveTextContent("Edit");
    expect(screen.getByTestId("action-scenario-3")).toHaveTextContent("Edit");
  });

  it("does not render action buttons when renderActions is undefined", async () => {
    const selectedIds = new Set<string>();
    render(
      <ScenarioPicker
        scenarios={mockScenarios}
        selectedIds={selectedIds}
        onToggle={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Scenarios (0)" }));

    // Should not have any action buttons
    expect(screen.queryByTestId(/action-/)).not.toBeInTheDocument();
  });
});

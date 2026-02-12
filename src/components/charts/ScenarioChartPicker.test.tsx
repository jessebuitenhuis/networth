import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ScenarioChartPicker } from "./ScenarioChartPicker";
import type { Scenario } from "@/models/Scenario.type";

const mockScenarios: Scenario[] = [
  { id: "scenario-1", name: "Optimistic" },
  { id: "scenario-2", name: "Pessimistic" },
  { id: "scenario-3", name: "Conservative" },
];

describe("ScenarioChartPicker", () => {
  it("renders button with 'Scenarios (N)' reflecting selected count", async () => {
    const selectedIds = new Set(["scenario-1", "scenario-2"]);
    render(
      <ScenarioChartPicker
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
      <ScenarioChartPicker
        scenarios={mockScenarios}
        selectedIds={selectedIds}
        onToggle={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: "Scenarios (0)" })
    ).toBeInTheDocument();
  });

  it("opening popover shows baseline as always-checked and disabled", async () => {
    const selectedIds = new Set<string>();
    render(
      <ScenarioChartPicker
        scenarios={mockScenarios}
        selectedIds={selectedIds}
        onToggle={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Scenarios (0)" }));

    const baselineCheckbox = screen.getByRole("checkbox", { name: "Baseline" });
    expect(baselineCheckbox).toBeChecked();
    expect(baselineCheckbox).toBeDisabled();
  });

  it("scenario checkboxes reflect selectedIds prop", async () => {
    const selectedIds = new Set(["scenario-1"]);
    render(
      <ScenarioChartPicker
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
      <ScenarioChartPicker
        scenarios={mockScenarios}
        selectedIds={selectedIds}
        onToggle={onToggle}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Scenarios (0)" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Optimistic" }));

    expect(onToggle).toHaveBeenCalledWith("scenario-1");
  });

  it("shows colored dots matching getScenarioColor", async () => {
    const selectedIds = new Set<string>();
    render(
      <ScenarioChartPicker
        scenarios={mockScenarios}
        selectedIds={selectedIds}
        onToggle={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Scenarios (0)" }));

    const dots = screen.getAllByTestId("scenario-color-dot");
    expect(dots).toHaveLength(3);
  });
});

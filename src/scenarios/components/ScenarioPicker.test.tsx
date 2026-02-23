import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Scenario } from "@/scenarios/Scenario.type";

import { ScenarioPickerPage } from "./ScenarioPicker.page";

const mockScenarios: Scenario[] = [
  { id: "scenario-1", name: "Optimistic" },
  { id: "scenario-2", name: "Pessimistic" },
  { id: "scenario-3", name: "Conservative" },
];

describe("ScenarioPicker", () => {
  it("renders button with 'Scenarios (N)' reflecting selected count", async () => {
    const selectedIds = new Set(["scenario-1", "scenario-2"]);
    const page = ScenarioPickerPage.render({
      scenarios: mockScenarios,
      selectedIds,
      onToggle: vi.fn(),
    });

    expect(page.triggerButton(2)).toBeInTheDocument();
  });

  it("shows 'Scenarios (0)' when none selected", () => {
    const page = ScenarioPickerPage.render({
      scenarios: mockScenarios,
      selectedIds: new Set<string>(),
      onToggle: vi.fn(),
    });

    expect(page.triggerButton(0)).toBeInTheDocument();
  });

  it("does not show 'Deselect all' button when no scenarios selected", async () => {
    const page = ScenarioPickerPage.render({
      scenarios: mockScenarios,
      selectedIds: new Set<string>(),
      onToggle: vi.fn(),
    });

    await page.open(0);

    expect(page.queryDeselectAllButton()).not.toBeInTheDocument();
  });

  it("shows 'Deselect all' button when scenarios are selected", async () => {
    const selectedIds = new Set(["scenario-1"]);
    const page = ScenarioPickerPage.render({
      scenarios: mockScenarios,
      selectedIds,
      onToggle: vi.fn(),
    });

    await page.open(1);

    expect(page.deselectAllButton).toBeInTheDocument();
  });

  it("clicking 'Deselect all' calls onClearAll", async () => {
    const onClearAll = vi.fn();
    const selectedIds = new Set(["scenario-1"]);
    const page = ScenarioPickerPage.render({
      scenarios: mockScenarios,
      selectedIds,
      onToggle: vi.fn(),
      onClearAll,
    });

    await page.open(1);
    await page.clickDeselectAll();

    expect(onClearAll).toHaveBeenCalled();
  });

  it("scenario checkboxes reflect selectedIds prop", async () => {
    const selectedIds = new Set(["scenario-1"]);
    const page = ScenarioPickerPage.render({
      scenarios: mockScenarios,
      selectedIds,
      onToggle: vi.fn(),
    });

    await page.open(1);

    expect(page.checkbox("Optimistic")).toBeChecked();
    expect(page.checkbox("Pessimistic")).not.toBeChecked();
    expect(page.checkbox("Conservative")).not.toBeChecked();
  });

  it("clicking a scenario checkbox calls onToggle with correct id", async () => {
    const onToggle = vi.fn();
    const page = ScenarioPickerPage.render({
      scenarios: mockScenarios,
      selectedIds: new Set<string>(),
      onToggle,
    });

    await page.open(0);
    await page.toggleCheckbox("Optimistic");

    expect(onToggle).toHaveBeenCalledWith("scenario-1");
  });

  it("renders action buttons via renderActions prop", async () => {
    const selectedIds = new Set<string>();
    const renderActions = (scenario: Scenario) => (
      <button data-testid={`action-${scenario.id}`}>Edit</button>
    );
    const page = ScenarioPickerPage.render({
      scenarios: mockScenarios,
      selectedIds,
      onToggle: vi.fn(),
      renderActions,
    });

    await page.open(0);

    expect(screen.getByTestId("action-scenario-1")).toHaveTextContent("Edit");
    expect(screen.getByTestId("action-scenario-2")).toHaveTextContent("Edit");
    expect(screen.getByTestId("action-scenario-3")).toHaveTextContent("Edit");
  });

  it("renders nothing when no scenarios exist", () => {
    const { container } = ScenarioPickerPage.renderAndGetContainer({
      scenarios: [],
      selectedIds: new Set<string>(),
      onToggle: vi.fn(),
    });

    expect(container).toBeEmptyDOMElement();
  });

  it("does not render action buttons when renderActions is undefined", async () => {
    const page = ScenarioPickerPage.render({
      scenarios: mockScenarios,
      selectedIds: new Set<string>(),
      onToggle: vi.fn(),
    });

    await page.open(0);

    expect(page.queryActionButton("scenario-1")).not.toBeInTheDocument();
  });
});

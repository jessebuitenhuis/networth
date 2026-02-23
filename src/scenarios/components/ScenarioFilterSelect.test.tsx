import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { suppressActWarnings } from "@/test/mocks/suppressActWarnings";

import { ScenarioFilterSelectPage } from "./ScenarioFilterSelect.page";

suppressActWarnings();

const mockScenarios = [
  { id: "s1", name: "Scenario 1", description: "" },
  { id: "s2", name: "Scenario 2", description: "" },
];

describe("ScenarioFilterSelect", () => {
  it("renders with 'Baseline only' as default", () => {
    const page = ScenarioFilterSelectPage.render({
      scenarios: mockScenarios,
      value: null,
      onValueChange: vi.fn(),
    });

    expect(page.trigger).toHaveTextContent("Baseline only");
  });

  it("renders with selected scenario name", () => {
    const page = ScenarioFilterSelectPage.render({
      scenarios: mockScenarios,
      value: "s1",
      onValueChange: vi.fn(),
    });

    expect(page.trigger).toHaveTextContent("Scenario 1");
  });

  it("lists baseline and all scenarios", async () => {
    const page = ScenarioFilterSelectPage.render({
      scenarios: mockScenarios,
      value: null,
      onValueChange: vi.fn(),
    });

    await page.open();

    expect(screen.getByRole("option", { name: "Baseline only" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Scenario 1" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Scenario 2" })).toBeInTheDocument();
  });

  it("calls onValueChange with null when 'Baseline only' is selected", async () => {
    const onValueChange = vi.fn();
    const page = ScenarioFilterSelectPage.render({
      scenarios: mockScenarios,
      value: "s1",
      onValueChange,
    });

    await page.selectScenario("Baseline only");

    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it("calls onValueChange with scenario ID when scenario is selected", async () => {
    const onValueChange = vi.fn();
    const page = ScenarioFilterSelectPage.render({
      scenarios: mockScenarios,
      value: null,
      onValueChange,
    });

    await page.selectScenario("Scenario 2");

    expect(onValueChange).toHaveBeenCalledWith("s2");
  });
});

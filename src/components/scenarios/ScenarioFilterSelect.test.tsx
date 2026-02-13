import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { suppressActWarnings } from "@/test/mocks/suppressActWarnings";

import { ScenarioFilterSelect } from "./ScenarioFilterSelect";

suppressActWarnings();

const mockScenarios = [
  { id: "s1", name: "Scenario 1", description: "" },
  { id: "s2", name: "Scenario 2", description: "" },
];

describe("ScenarioFilterSelect", () => {
  it("renders with 'Baseline only' as default", () => {
    render(
      <ScenarioFilterSelect
        scenarios={mockScenarios}
        value={null}
        onValueChange={vi.fn()}
      />
    );

    const trigger = screen.getByRole("combobox", { name: "Scenario filter" });
    expect(trigger).toHaveTextContent("Baseline only");
  });

  it("renders with selected scenario name", () => {
    render(
      <ScenarioFilterSelect
        scenarios={mockScenarios}
        value="s1"
        onValueChange={vi.fn()}
      />
    );

    const trigger = screen.getByRole("combobox", { name: "Scenario filter" });
    expect(trigger).toHaveTextContent("Scenario 1");
  });

  it("lists baseline and all scenarios", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioFilterSelect
        scenarios={mockScenarios}
        value={null}
        onValueChange={vi.fn()}
      />
    );

    const trigger = screen.getByRole("combobox", { name: "Scenario filter" });
    await user.click(trigger);

    expect(screen.getByRole("option", { name: "Baseline only" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Scenario 1" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Scenario 2" })).toBeInTheDocument();
  });

  it("calls onValueChange with null when 'Baseline only' is selected", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <ScenarioFilterSelect
        scenarios={mockScenarios}
        value="s1"
        onValueChange={onValueChange}
      />
    );

    const trigger = screen.getByRole("combobox", { name: "Scenario filter" });
    await user.click(trigger);

    const baselineOption = screen.getByRole("option", { name: "Baseline only" });
    await user.click(baselineOption);

    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it("calls onValueChange with scenario ID when scenario is selected", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <ScenarioFilterSelect
        scenarios={mockScenarios}
        value={null}
        onValueChange={onValueChange}
      />
    );

    const trigger = screen.getByRole("combobox", { name: "Scenario filter" });
    await user.click(trigger);

    const scenario2Option = screen.getByRole("option", { name: "Scenario 2" });
    await user.click(scenario2Option);

    expect(onValueChange).toHaveBeenCalledWith("s2");
  });
});

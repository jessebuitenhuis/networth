import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScenarioSelector } from "./ScenarioSelector";
import type { Scenario } from "@/models/Scenario";

describe("ScenarioSelector", () => {
  const scenarios: Scenario[] = [
    { id: "1", name: "Base Plan" },
    { id: "2", name: "Optimistic" },
    { id: "3", name: "Conservative" },
  ];

  it("renders dropdown with active scenario", () => {
    render(
      <ScenarioSelector
        scenarios={scenarios}
        activeScenarioId="1"
        onSelect={vi.fn()}
      />
    );

    expect(
      screen.getByRole("combobox", { name: /scenario/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveTextContent("Base Plan");
  });

  it("shows all scenarios when opened", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioSelector
        scenarios={scenarios}
        activeScenarioId="1"
        onSelect={vi.fn()}
      />
    );

    await user.click(screen.getByRole("combobox"));

    expect(screen.getByRole("option", { name: "Base Plan" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Optimistic" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Conservative" })).toBeInTheDocument();
  });

  it("calls onSelect when scenario is chosen", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <ScenarioSelector
        scenarios={scenarios}
        activeScenarioId="1"
        onSelect={onSelect}
      />
    );

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByRole("option", { name: "Optimistic" }));

    expect(onSelect).toHaveBeenCalledWith("2");
  });

  it("renders with null activeScenarioId", () => {
    render(
      <ScenarioSelector
        scenarios={scenarios}
        activeScenarioId={null}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("handles empty scenarios list", () => {
    render(
      <ScenarioSelector
        scenarios={[]}
        activeScenarioId={null}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});

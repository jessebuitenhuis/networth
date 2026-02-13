import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ScenarioLegend } from "./ScenarioLegend";

describe("ScenarioLegend", () => {
  it("renders nothing when entries array is empty", () => {
    const { container } = render(<ScenarioLegend entries={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders each entry with name and color", () => {
    const entries = [
      { name: "Baseline", color: "#3b82f6", isDashed: false },
      { name: "Optimistic", color: "#ef4444", isDashed: true },
      { name: "Conservative", color: "#22c55e", isDashed: true },
    ];

    render(<ScenarioLegend entries={entries} />);

    expect(screen.getByText("Baseline")).toBeInTheDocument();
    expect(screen.getByText("Optimistic")).toBeInTheDocument();
    expect(screen.getByText("Conservative")).toBeInTheDocument();
  });

  it("renders solid line indicator for non-dashed entries", () => {
    const entries = [
      { name: "Baseline", color: "#3b82f6", isDashed: false },
    ];

    const { container } = render(<ScenarioLegend entries={entries} />);
    const indicator = container.querySelector('[data-testid="legend-indicator"]');

    expect(indicator).toBeInTheDocument();
    expect(indicator?.className).not.toContain("dashed");
  });

  it("renders dashed line indicator for dashed entries", () => {
    const entries = [
      { name: "Optimistic", color: "#ef4444", isDashed: true },
    ];

    const { container } = render(<ScenarioLegend entries={entries} />);
    const indicator = container.querySelector('[data-testid="legend-indicator"]');

    expect(indicator).toBeInTheDocument();
    expect(indicator?.className).toContain("dashed");
  });

  it("applies correct color to indicators", () => {
    const entries = [
      { name: "Baseline", color: "#3b82f6", isDashed: false },
      { name: "Optimistic", color: "#ef4444", isDashed: true },
    ];

    const { container } = render(<ScenarioLegend entries={entries} />);
    const indicators = container.querySelectorAll('[data-testid="legend-indicator"]');

    expect(indicators).toHaveLength(2);
    expect((indicators[0] as HTMLElement).style.borderColor).toBe("rgb(59, 130, 246)");
    expect((indicators[1] as HTMLElement).style.borderColor).toBe("rgb(239, 68, 68)");
  });

  it("renders entries in a centered flex-wrap row", () => {
    const entries = [
      { name: "Baseline", color: "#3b82f6", isDashed: false },
      { name: "Optimistic", color: "#ef4444", isDashed: true },
    ];

    const { container } = render(<ScenarioLegend entries={entries} />);
    const wrapper = container.firstChild as HTMLElement;

    expect(wrapper.className).toContain("flex");
    expect(wrapper.className).toContain("flex-wrap");
    expect(wrapper.className).toContain("justify-center");
  });
});

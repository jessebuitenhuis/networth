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
      { name: "Baseline", color: "#3b82f6", lineStyle: "solid" as const },
      { name: "Optimistic", color: "#ef4444", lineStyle: "dashed" as const },
      { name: "Conservative", color: "#22c55e", lineStyle: "dashed" as const },
    ];

    render(<ScenarioLegend entries={entries} />);

    expect(screen.getByText("Baseline")).toBeInTheDocument();
    expect(screen.getByText("Optimistic")).toBeInTheDocument();
    expect(screen.getByText("Conservative")).toBeInTheDocument();
  });

  it("renders solid line indicator for non-dashed entries", () => {
    const entries = [
      { name: "Baseline", color: "#3b82f6", lineStyle: "solid" as const },
    ];

    const { container } = render(<ScenarioLegend entries={entries} />);
    const indicator = container.querySelector('[data-testid="legend-indicator"]');

    expect(indicator).toBeInTheDocument();
    expect((indicator as HTMLElement).style.borderStyle).toBe("solid");
  });

  it("renders dashed line indicator for dashed entries", () => {
    const entries = [
      { name: "Optimistic", color: "#ef4444", lineStyle: "dashed" as const },
    ];

    const { container } = render(<ScenarioLegend entries={entries} />);
    const indicator = container.querySelector('[data-testid="legend-indicator"]');

    expect(indicator).toBeInTheDocument();
    expect((indicator as HTMLElement).style.borderStyle).toBe("dashed");
  });

  it("applies correct color to indicators", () => {
    const entries = [
      { name: "Baseline", color: "#3b82f6", lineStyle: "solid" as const },
      { name: "Optimistic", color: "#ef4444", lineStyle: "dashed" as const },
    ];

    const { container } = render(<ScenarioLegend entries={entries} />);
    const indicators = container.querySelectorAll('[data-testid="legend-indicator"]');

    expect(indicators).toHaveLength(2);
    expect((indicators[0] as HTMLElement).style.borderColor).toBe("rgb(59, 130, 246)");
    expect((indicators[1] as HTMLElement).style.borderColor).toBe("rgb(239, 68, 68)");
  });

  it("renders entries in a centered flex-wrap row", () => {
    const entries = [
      { name: "Baseline", color: "#3b82f6", lineStyle: "solid" as const },
      { name: "Optimistic", color: "#ef4444", lineStyle: "dashed" as const },
    ];

    const { container } = render(<ScenarioLegend entries={entries} />);
    const wrapper = container.firstChild as HTMLElement;

    expect(wrapper.className).toContain("flex");
    expect(wrapper.className).toContain("flex-wrap");
    expect(wrapper.className).toContain("justify-center");
  });

  it("renders dotted border style when lineStyle is dotted", () => {
    const entries = [
      { name: "Goal 1", color: "#f59e0b", lineStyle: "dotted" as const },
    ];

    const { container } = render(<ScenarioLegend entries={entries} />);
    const indicator = container.querySelector('[data-testid="legend-indicator"]');

    expect(indicator).toBeInTheDocument();
    expect((indicator as HTMLElement).style.borderStyle).toBe("dotted");
  });

  it("works with lineStyle solid", () => {
    const entries = [
      { name: "Baseline", color: "#3b82f6", lineStyle: "solid" as const },
    ];

    const { container } = render(<ScenarioLegend entries={entries} />);
    const indicator = container.querySelector('[data-testid="legend-indicator"]');

    expect(indicator).toBeInTheDocument();
    expect((indicator as HTMLElement).style.borderStyle).toBe("solid");
  });

  it("works with lineStyle dashed", () => {
    const entries = [
      { name: "Scenario", color: "#ef4444", lineStyle: "dashed" as const },
    ];

    const { container } = render(<ScenarioLegend entries={entries} />);
    const indicator = container.querySelector('[data-testid="legend-indicator"]');

    expect(indicator).toBeInTheDocument();
    expect((indicator as HTMLElement).style.borderStyle).toBe("dashed");
  });
});

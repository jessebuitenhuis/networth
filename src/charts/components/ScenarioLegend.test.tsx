import { describe, expect, it } from "vitest";

import { ScenarioLegendPage } from "./ScenarioLegend.page";

describe("ScenarioLegend", () => {
  it("renders nothing when entries array is empty", () => {
    const page = ScenarioLegendPage.render({ entries: [] });
    expect(page.container).toBeEmptyDOMElement();
  });

  it("renders each entry with name and color", () => {
    const entries = [
      { name: "Baseline", color: "#3b82f6", lineStyle: "solid" as const },
      { name: "Optimistic", color: "#ef4444", lineStyle: "dashed" as const },
      { name: "Conservative", color: "#22c55e", lineStyle: "dashed" as const },
    ];

    const page = ScenarioLegendPage.render({ entries });

    expect(page.getText("Baseline")).toBeInTheDocument();
    expect(page.getText("Optimistic")).toBeInTheDocument();
    expect(page.getText("Conservative")).toBeInTheDocument();
  });

  it("renders solid line indicator for non-dashed entries", () => {
    const entries = [{ name: "Baseline", color: "#3b82f6", lineStyle: "solid" as const }];
    const page = ScenarioLegendPage.render({ entries });
    const indicator = page.legendIndicators[0] as HTMLElement;

    expect(indicator).toBeInTheDocument();
    expect(indicator.style.borderStyle).toBe("solid");
  });

  it("renders dashed line indicator for dashed entries", () => {
    const entries = [{ name: "Optimistic", color: "#ef4444", lineStyle: "dashed" as const }];
    const page = ScenarioLegendPage.render({ entries });
    const indicator = page.legendIndicators[0] as HTMLElement;

    expect(indicator).toBeInTheDocument();
    expect(indicator.style.borderStyle).toBe("dashed");
  });

  it("applies correct color to indicators", () => {
    const entries = [
      { name: "Baseline", color: "#3b82f6", lineStyle: "solid" as const },
      { name: "Optimistic", color: "#ef4444", lineStyle: "dashed" as const },
    ];
    const page = ScenarioLegendPage.render({ entries });
    const indicators = page.legendIndicators;

    expect(indicators).toHaveLength(2);
    expect((indicators[0] as HTMLElement).style.borderColor).toBe("rgb(59, 130, 246)");
    expect((indicators[1] as HTMLElement).style.borderColor).toBe("rgb(239, 68, 68)");
  });

  it("renders entries in a centered flex-wrap row", () => {
    const entries = [
      { name: "Baseline", color: "#3b82f6", lineStyle: "solid" as const },
      { name: "Optimistic", color: "#ef4444", lineStyle: "dashed" as const },
    ];
    const page = ScenarioLegendPage.render({ entries });
    const wrapper = page.wrapper;

    expect(wrapper!.className).toContain("flex");
    expect(wrapper!.className).toContain("flex-wrap");
    expect(wrapper!.className).toContain("justify-center");
  });

  it.each([
    { name: "Goal 1", color: "#f59e0b", lineStyle: "dotted" as const },
    { name: "Baseline", color: "#3b82f6", lineStyle: "solid" as const },
    { name: "Scenario", color: "#ef4444", lineStyle: "dashed" as const },
  ])("renders $lineStyle border style for lineStyle=$lineStyle", ({ name, color, lineStyle }) => {
    const page = ScenarioLegendPage.render({ entries: [{ name, color, lineStyle }] });
    const indicator = page.legendIndicators[0] as HTMLElement;

    expect(indicator).toBeInTheDocument();
    expect(indicator.style.borderStyle).toBe(lineStyle);
  });
});

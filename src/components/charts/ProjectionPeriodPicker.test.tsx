import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProjectionPeriodPicker } from "./ProjectionPeriodPicker";
import { ProjectionPeriod } from "@/models/ProjectionPeriod";

describe("ProjectionPeriodPicker", () => {
  it("renders five period buttons", () => {
    render(
      <ProjectionPeriodPicker
        selected={ProjectionPeriod.ThreeMonths}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "1M" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3M" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "6M" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1Y" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Custom" })).toBeInTheDocument();
  });

  it("marks the selected period as pressed", () => {
    render(
      <ProjectionPeriodPicker
        selected={ProjectionPeriod.SixMonths}
        onSelect={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "6M" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "1M" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("calls onSelect with the clicked period", async () => {
    const onSelect = vi.fn();
    render(
      <ProjectionPeriodPicker
        selected={ProjectionPeriod.ThreeMonths}
        onSelect={onSelect}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "1Y" }));

    expect(onSelect).toHaveBeenCalledWith(ProjectionPeriod.OneYear);
  });
});

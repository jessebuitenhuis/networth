import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DuplicateScenarioDialog } from "./DuplicateScenarioDialog";

function renderDialog(
  overrides: Partial<React.ComponentProps<typeof DuplicateScenarioDialog>> = {},
) {
  const props = {
    scenarioName: "Base Plan",
    onSubmit: vi.fn(),
    ...overrides,
  };
  render(<DuplicateScenarioDialog {...props} />);
  return props;
}

describe("DuplicateScenarioDialog", () => {
  it("renders icon-only trigger button", () => {
    renderDialog();

    const button = screen.getByLabelText("Duplicate Scenario");
    expect(button.className).toContain("h-6");
    expect(button.className).toContain("w-6");
  });

  it("opens dialog with name input pre-filled from scenarioName prop", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /duplicate scenario/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toHaveValue("Base Plan (Copy)");
  });

  it("calls onSubmit with entered name", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderDialog();

    await user.click(screen.getByRole("button"));
    await user.clear(screen.getByLabelText(/name/i));
    await user.type(screen.getByLabelText(/name/i), "Optimistic Plan");
    await user.click(screen.getByRole("button", { name: /duplicate$/i }));

    expect(onSubmit).toHaveBeenCalledWith("Optimistic Plan");
  });

  it("calls onSubmit with pre-filled name when submitting directly", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderDialog();

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("button", { name: /duplicate$/i }));

    expect(onSubmit).toHaveBeenCalledWith("Base Plan (Copy)");
  });

  it("closes dialog after successful submit", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("button", { name: /duplicate$/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("disables submit when name is empty", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button"));
    await user.clear(screen.getByLabelText(/name/i));

    expect(
      screen.getByRole("button", { name: /duplicate$/i }),
    ).toBeDisabled();
  });

  it("resets form when dialog is reopened", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button"));
    const input = screen.getByLabelText(/name/i);
    await user.clear(input);
    await user.type(input, "Modified Name");
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    await user.click(screen.getByRole("button"));
    expect(screen.getByLabelText(/name/i)).toHaveValue("Base Plan (Copy)");
  });

  it("does not pre-fill name when scenarioName is not provided", async () => {
    const user = userEvent.setup();
    renderDialog({ scenarioName: undefined });

    await user.click(screen.getByRole("button"));

    expect(screen.getByLabelText(/name/i)).toHaveValue("");
  });

  it("stops propagation on trigger click", async () => {
    const parentClickHandler = vi.fn();
    const user = userEvent.setup();

    render(
      <div onClick={parentClickHandler}>
        <DuplicateScenarioDialog scenarioName="Base Plan" onSubmit={vi.fn()} />
      </div>,
    );

    await user.click(screen.getByRole("button"));

    expect(parentClickHandler).not.toHaveBeenCalled();
  });
});

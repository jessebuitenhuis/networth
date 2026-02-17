import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CreateScenarioDialog } from "./CreateScenarioDialog";

function renderDialog(onSubmit = vi.fn()) {
  render(<CreateScenarioDialog onSubmit={onSubmit} />);
  return { onSubmit };
}

describe("CreateScenarioDialog", () => {
  it("renders trigger button", () => {
    renderDialog();
    expect(screen.getByRole("button", { name: /new scenario/i })).toBeInTheDocument();
  });

  it("opens dialog when trigger is clicked", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: /new scenario/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /create scenario/i }),
    ).toBeInTheDocument();
  });

  it("calls onSubmit with trimmed name", async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderDialog();

    await user.click(screen.getByRole("button", { name: /new scenario/i }));
    await user.type(screen.getByLabelText(/name/i), "Optimistic Plan");
    await user.click(screen.getByRole("button", { name: /create$/i }));

    expect(onSubmit).toHaveBeenCalledWith("Optimistic Plan");
  });

  it("closes dialog after creating scenario", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: /new scenario/i }));
    await user.type(screen.getByLabelText(/name/i), "Test");
    await user.click(screen.getByRole("button", { name: /create$/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("clears input when dialog is closed", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: /new scenario/i }));
    const input = screen.getByLabelText(/name/i);
    await user.type(input, "Test");
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    await user.click(screen.getByRole("button", { name: /new scenario/i }));
    expect(screen.getByLabelText(/name/i)).toHaveValue("");
  });

  it("disables create button when name is empty", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: /new scenario/i }));

    expect(screen.getByRole("button", { name: /create$/i })).toBeDisabled();
  });

  it("does not create scenario when name is only whitespace", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: /new scenario/i }));
    await user.type(screen.getByLabelText(/name/i), "   ");

    const createButton = screen.getByRole("button", { name: /create$/i });
    expect(createButton).toBeDisabled();
  });
});

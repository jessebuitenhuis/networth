import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach,describe, expect, it, vi } from "vitest";

import { ScenarioProvider } from "@/context/ScenarioContext";
import { ScenarioStorage } from "@/services/ScenarioStorage";

import { CreateScenarioDialog } from "./CreateScenarioDialog";

vi.mock("@/services/ScenarioStorage");

describe("CreateScenarioDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(ScenarioStorage.loadScenarios).mockReturnValue([
      { id: "1", name: "Base Plan" },
    ]);
    vi.mocked(ScenarioStorage.loadActiveScenarioId).mockReturnValue("1");
  });

  it("renders trigger button", () => {
    render(
      <ScenarioProvider>
        <CreateScenarioDialog />
      </ScenarioProvider>
    );

    expect(
      screen.getByRole("button", { name: /new scenario/i })
    ).toBeInTheDocument();
  });

  it("opens dialog when trigger is clicked", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <CreateScenarioDialog />
      </ScenarioProvider>
    );

    await user.click(screen.getByRole("button", { name: /new scenario/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /create scenario/i })
    ).toBeInTheDocument();
  });

  it("creates scenario with entered name", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <CreateScenarioDialog />
      </ScenarioProvider>
    );

    await user.click(screen.getByRole("button", { name: /new scenario/i }));
    await user.type(screen.getByLabelText(/name/i), "Optimistic Plan");
    await user.click(screen.getByRole("button", { name: /create$/i }));

    expect(ScenarioStorage.saveScenarios).toHaveBeenCalled();
    const calls = vi.mocked(ScenarioStorage.saveScenarios).mock.calls;
    const lastCall = calls[calls.length - 1][0];
    expect(lastCall).toContainEqual(
      expect.objectContaining({ name: "Optimistic Plan" })
    );
  });

  it("sets new scenario as active", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <CreateScenarioDialog />
      </ScenarioProvider>
    );

    await user.click(screen.getByRole("button", { name: /new scenario/i }));
    await user.type(screen.getByLabelText(/name/i), "New Scenario");
    await user.click(screen.getByRole("button", { name: /create$/i }));

    expect(ScenarioStorage.saveActiveScenarioId).toHaveBeenCalled();
  });

  it("closes dialog after creating scenario", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <CreateScenarioDialog />
      </ScenarioProvider>
    );

    await user.click(screen.getByRole("button", { name: /new scenario/i }));
    await user.type(screen.getByLabelText(/name/i), "Test");
    await user.click(screen.getByRole("button", { name: /create$/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("clears input when dialog is closed", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <CreateScenarioDialog />
      </ScenarioProvider>
    );

    await user.click(screen.getByRole("button", { name: /new scenario/i }));
    const input = screen.getByLabelText(/name/i);
    await user.type(input, "Test");
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    await user.click(screen.getByRole("button", { name: /new scenario/i }));
    expect(screen.getByLabelText(/name/i)).toHaveValue("");
  });

  it("disables create button when name is empty", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <CreateScenarioDialog />
      </ScenarioProvider>
    );

    await user.click(screen.getByRole("button", { name: /new scenario/i }));

    expect(screen.getByRole("button", { name: /create$/i })).toBeDisabled();
  });

  it("does not create scenario when name is only whitespace", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <CreateScenarioDialog />
      </ScenarioProvider>
    );

    const initialCallCount = vi.mocked(ScenarioStorage.saveScenarios).mock.calls.length;

    await user.click(screen.getByRole("button", { name: /new scenario/i }));
    await user.type(screen.getByLabelText(/name/i), "   "); // Only spaces

    // Try to submit (button should still be disabled due to trim)
    const createButton = screen.getByRole("button", { name: /create$/i });
    expect(createButton).toBeDisabled();

    // Verify no new scenario was created
    expect(vi.mocked(ScenarioStorage.saveScenarios).mock.calls.length).toBe(initialCallCount);
  });

  it("closes dialog via Escape key without creating scenario", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <CreateScenarioDialog />
      </ScenarioProvider>
    );

    const initialCallCount = vi.mocked(ScenarioStorage.saveScenarios).mock.calls.length;

    await user.click(screen.getByRole("button", { name: /new scenario/i }));
    await user.type(screen.getByLabelText(/name/i), "Test Scenario");

    // Close with Escape instead of submitting
    await user.keyboard("{Escape}");

    // Dialog should be closed
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // No scenario should have been created
    expect(vi.mocked(ScenarioStorage.saveScenarios).mock.calls.length).toBe(initialCallCount);
  });

  it("trims whitespace from scenario name", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <CreateScenarioDialog />
      </ScenarioProvider>
    );

    await user.click(screen.getByRole("button", { name: /new scenario/i }));
    await user.type(screen.getByLabelText(/name/i), "  Padded Name  ");
    await user.click(screen.getByRole("button", { name: /create$/i }));

    expect(ScenarioStorage.saveScenarios).toHaveBeenCalled();
    const calls = vi.mocked(ScenarioStorage.saveScenarios).mock.calls;
    const lastCall = calls[calls.length - 1][0];
    expect(lastCall).toContainEqual(
      expect.objectContaining({ name: "Padded Name" })
    );
  });

  it("does not submit when form is submitted with empty name programmatically", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <CreateScenarioDialog />
      </ScenarioProvider>
    );

    const initialCallCount = vi.mocked(ScenarioStorage.saveScenarios).mock.calls.length;

    await user.click(screen.getByRole("button", { name: /new scenario/i }));

    const form = screen.getByRole("dialog").querySelector("form");
    expect(form).toBeInTheDocument();

    form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

    expect(vi.mocked(ScenarioStorage.saveScenarios).mock.calls.length).toBe(initialCallCount);
  });

  it("calls onCreate callback with new scenario id", async () => {
    const onCreate = vi.fn();
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <CreateScenarioDialog onCreate={onCreate} />
      </ScenarioProvider>
    );

    await user.click(screen.getByRole("button", { name: /new scenario/i }));
    await user.type(screen.getByLabelText(/name/i), "New Scenario");
    await user.click(screen.getByRole("button", { name: /create$/i }));

    expect(onCreate).toHaveBeenCalledWith(expect.any(String));
  });
});

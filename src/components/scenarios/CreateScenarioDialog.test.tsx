import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ScenarioProvider } from "@/scenarios/ScenarioContext";

import { CreateScenarioDialog } from "./CreateScenarioDialog";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockReset();
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      scenarios: [{ id: "1", name: "Base Plan" }],
      activeScenarioId: "1",
    }),
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CreateScenarioDialog", () => {
  it("renders trigger button", async () => {
    render(
      <ScenarioProvider>
        <CreateScenarioDialog />
      </ScenarioProvider>,
    );

    expect(
      await screen.findByRole("button", { name: /new scenario/i }),
    ).toBeInTheDocument();
  });

  it("opens dialog when trigger is clicked", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <CreateScenarioDialog />
      </ScenarioProvider>,
    );

    await user.click(
      await screen.findByRole("button", { name: /new scenario/i }),
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /create scenario/i }),
    ).toBeInTheDocument();
  });

  it("creates scenario with entered name", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          scenarios: [{ id: "1", name: "Base Plan" }],
          activeScenarioId: "1",
        }),
      })
      .mockResolvedValue({ ok: true, json: async () => ({}) });

    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <CreateScenarioDialog />
      </ScenarioProvider>,
    );

    await user.click(
      await screen.findByRole("button", { name: /new scenario/i }),
    );
    await user.type(screen.getByLabelText(/name/i), "Optimistic Plan");
    await user.click(screen.getByRole("button", { name: /create$/i }));

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/scenarios",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("Optimistic Plan"),
      }),
    );
  });

  it("closes dialog after creating scenario", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });

    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <CreateScenarioDialog />
      </ScenarioProvider>,
    );

    await user.click(
      await screen.findByRole("button", { name: /new scenario/i }),
    );
    await user.type(screen.getByLabelText(/name/i), "Test");
    await user.click(screen.getByRole("button", { name: /create$/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("clears input when dialog is closed", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <CreateScenarioDialog />
      </ScenarioProvider>,
    );

    await user.click(
      await screen.findByRole("button", { name: /new scenario/i }),
    );
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
      </ScenarioProvider>,
    );

    await user.click(
      await screen.findByRole("button", { name: /new scenario/i }),
    );

    expect(screen.getByRole("button", { name: /create$/i })).toBeDisabled();
  });

  it("does not create scenario when name is only whitespace", async () => {
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <CreateScenarioDialog />
      </ScenarioProvider>,
    );

    await user.click(
      await screen.findByRole("button", { name: /new scenario/i }),
    );
    await user.type(screen.getByLabelText(/name/i), "   ");

    const createButton = screen.getByRole("button", { name: /create$/i });
    expect(createButton).toBeDisabled();
  });

  it("calls onCreate callback with new scenario id", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });

    const onCreate = vi.fn();
    const user = userEvent.setup();
    render(
      <ScenarioProvider>
        <CreateScenarioDialog onCreate={onCreate} />
      </ScenarioProvider>,
    );

    await user.click(
      await screen.findByRole("button", { name: /new scenario/i }),
    );
    await user.type(screen.getByLabelText(/name/i), "New Scenario");
    await user.click(screen.getByRole("button", { name: /create$/i }));

    expect(onCreate).toHaveBeenCalledWith(expect.any(String));
  });
});

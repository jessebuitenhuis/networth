import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AccountProvider } from "@/accounts/AccountContext";
import { RecurringTransactionProvider } from "@/recurring-transactions/RecurringTransactionContext";
import { ScenarioProvider } from "@/scenarios/ScenarioContext";
import { TransactionProvider } from "@/transactions/TransactionContext";

import { DuplicateScenarioDialog } from "./DuplicateScenarioDialog";

const mockFetch = vi.fn();

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <AccountProvider>
      <TransactionProvider>
        <ScenarioProvider>
          <RecurringTransactionProvider>{children}</RecurringTransactionProvider>
        </ScenarioProvider>
      </TransactionProvider>
    </AccountProvider>
  );
}

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  mockFetch.mockReset();
  mockFetch.mockImplementation(async (url: string) => {
    if (url === "/api/accounts") {
      return { ok: true, json: async () => [] };
    }
    if (url === "/api/transactions") {
      return { ok: true, json: async () => [] };
    }
    if (url === "/api/scenarios") {
      return {
        ok: true,
        json: async () => ({
          scenarios: [{ id: "scenario-1", name: "Base Plan" }],
          activeScenarioId: null,
        }),
      };
    }
    if (url === "/api/recurring-transactions") {
      return { ok: true, json: async () => [] };
    }
    return { ok: true, status: 200, json: async () => ({}) };
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("DuplicateScenarioDialog", () => {
  it("renders icon-only trigger button", async () => {
    render(
      <Wrapper>
        <DuplicateScenarioDialog scenarioId="scenario-1" />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
    const button = screen.getByRole("button");
    expect(button.className).toContain("h-6");
    expect(button.className).toContain("w-6");
  });

  it("opens dialog with name input pre-filled from scenarioId prop", async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <DuplicateScenarioDialog scenarioId="scenario-1" />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /duplicate scenario/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toHaveValue("Base Plan (Copy)");
  });

  it("creates new scenario on submit", async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <DuplicateScenarioDialog scenarioId="scenario-1" />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button"));
    await user.clear(screen.getByLabelText(/name/i));
    await user.type(screen.getByLabelText(/name/i), "Optimistic Plan");
    await user.click(screen.getByRole("button", { name: /duplicate$/i }));

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/scenarios",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("Optimistic Plan"),
      }),
    );
  });

  it("calls onDuplicate callback with new scenario id", async () => {
    const onDuplicate = vi.fn();
    const user = userEvent.setup();
    render(
      <Wrapper>
        <DuplicateScenarioDialog
          scenarioId="scenario-1"
          onDuplicate={onDuplicate}
        />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("button", { name: /duplicate$/i }));

    expect(onDuplicate).toHaveBeenCalledWith(expect.any(String));
    expect(onDuplicate.mock.calls[0][0]).not.toBe("scenario-1");
  });

  it("closes dialog after successful submit", async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <DuplicateScenarioDialog scenarioId="scenario-1" />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("button", { name: /duplicate$/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("disables submit when name is empty", async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <DuplicateScenarioDialog scenarioId="scenario-1" />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button"));
    await user.clear(screen.getByLabelText(/name/i));

    expect(
      screen.getByRole("button", { name: /duplicate$/i }),
    ).toBeDisabled();
  });

  it("resets form when dialog is reopened", async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <DuplicateScenarioDialog scenarioId="scenario-1" />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button"));
    const input = screen.getByLabelText(/name/i);
    await user.clear(input);
    await user.type(input, "Modified Name");
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    await user.click(screen.getByRole("button"));
    expect(screen.getByLabelText(/name/i)).toHaveValue("Base Plan (Copy)");
  });

  it("does not pre-fill name when scenario is not found", async () => {
    const user = userEvent.setup();
    render(
      <Wrapper>
        <DuplicateScenarioDialog scenarioId="non-existent-scenario" />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button"));

    expect(screen.getByLabelText(/name/i)).toHaveValue("");
  });

  it("stops propagation on trigger click", async () => {
    const parentClickHandler = vi.fn();
    const user = userEvent.setup();

    render(
      <div onClick={parentClickHandler}>
        <Wrapper>
          <DuplicateScenarioDialog scenarioId="scenario-1" />
        </Wrapper>
      </div>,
    );

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button"));

    expect(parentClickHandler).not.toHaveBeenCalled();
  });
});

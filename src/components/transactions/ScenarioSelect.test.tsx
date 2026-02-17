import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { Scenario } from "@/scenarios/Scenario.type";

import { ScenarioSelect } from "./ScenarioSelect";

const mockScenarios: Scenario[] = [
  { id: "scenario-1", name: "Retirement" },
  { id: "scenario-2", name: "House Purchase" },
];

describe("ScenarioSelect", () => {
  describe("Rendering", () => {
    it("renders combobox with Scenario aria-label", () => {
      const mockOnValueChange = vi.fn();
      const mockOnCreateScenario = vi.fn();

      render(
        <ScenarioSelect
          scenarios={mockScenarios}
          value="none"
          onValueChange={mockOnValueChange}
          onCreateScenario={mockOnCreateScenario}
        />
      );

      expect(screen.getByRole("combobox", { name: /scenario/i })).toBeInTheDocument();
    });

    it("shows None (Baseline) and existing scenarios when opened", async () => {
      const user = userEvent.setup();
      const mockOnValueChange = vi.fn();
      const mockOnCreateScenario = vi.fn();

      render(
        <ScenarioSelect
          scenarios={mockScenarios}
          value="none"
          onValueChange={mockOnValueChange}
          onCreateScenario={mockOnCreateScenario}
        />
      );

      await user.click(screen.getByRole("combobox", { name: /scenario/i }));

      expect(screen.getByRole("option", { name: "None (Baseline)" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Retirement" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "House Purchase" })).toBeInTheDocument();
    });

    it('shows "Create new scenario..." as last option', async () => {
      const user = userEvent.setup();
      const mockOnValueChange = vi.fn();
      const mockOnCreateScenario = vi.fn();

      render(
        <ScenarioSelect
          scenarios={mockScenarios}
          value="none"
          onValueChange={mockOnValueChange}
          onCreateScenario={mockOnCreateScenario}
        />
      );

      await user.click(screen.getByRole("combobox", { name: /scenario/i }));

      const options = screen.getAllByRole("option");
      expect(options[options.length - 1]).toHaveTextContent("Create new scenario...");
    });

  });

  describe("Selection", () => {
    it("calls onValueChange when selecting an existing scenario", async () => {
      const user = userEvent.setup();
      const mockOnValueChange = vi.fn();
      const mockOnCreateScenario = vi.fn();

      render(
        <ScenarioSelect
          scenarios={mockScenarios}
          value="none"
          onValueChange={mockOnValueChange}
          onCreateScenario={mockOnCreateScenario}
        />
      );

      await user.click(screen.getByRole("combobox", { name: /scenario/i }));
      await user.click(screen.getByRole("option", { name: "Retirement" }));

      expect(mockOnValueChange).toHaveBeenCalledWith("scenario-1");
    });

    it("calls onValueChange when selecting None (Baseline)", async () => {
      const user = userEvent.setup();
      const mockOnValueChange = vi.fn();
      const mockOnCreateScenario = vi.fn();

      render(
        <ScenarioSelect
          scenarios={mockScenarios}
          value="scenario-1"
          onValueChange={mockOnValueChange}
          onCreateScenario={mockOnCreateScenario}
        />
      );

      await user.click(screen.getByRole("combobox", { name: /scenario/i }));
      await user.click(screen.getByRole("option", { name: "None (Baseline)" }));

      expect(mockOnValueChange).toHaveBeenCalledWith("none");
    });
  });

  describe("Mode switch", () => {
    it('switches to create mode when "Create new scenario..." is selected', async () => {
      const user = userEvent.setup();
      const mockOnValueChange = vi.fn();
      const mockOnCreateScenario = vi.fn();

      render(
        <ScenarioSelect
          scenarios={mockScenarios}
          value="none"
          onValueChange={mockOnValueChange}
          onCreateScenario={mockOnCreateScenario}
        />
      );

      await user.click(screen.getByRole("combobox", { name: /scenario/i }));
      await user.click(screen.getByRole("option", { name: "Create new scenario..." }));

      expect(screen.getByLabelText(/scenario name/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("does not call onValueChange when entering create mode", async () => {
      const user = userEvent.setup();
      const mockOnValueChange = vi.fn();
      const mockOnCreateScenario = vi.fn();

      render(
        <ScenarioSelect
          scenarios={mockScenarios}
          value="none"
          onValueChange={mockOnValueChange}
          onCreateScenario={mockOnCreateScenario}
        />
      );

      await user.click(screen.getByRole("combobox", { name: /scenario/i }));
      await user.click(screen.getByRole("option", { name: "Create new scenario..." }));

      expect(mockOnValueChange).not.toHaveBeenCalled();
    });

    it("auto-focuses the input in create mode", async () => {
      const user = userEvent.setup();
      const mockOnValueChange = vi.fn();
      const mockOnCreateScenario = vi.fn();

      render(
        <ScenarioSelect
          scenarios={mockScenarios}
          value="none"
          onValueChange={mockOnValueChange}
          onCreateScenario={mockOnCreateScenario}
        />
      );

      await user.click(screen.getByRole("combobox", { name: /scenario/i }));
      await user.click(screen.getByRole("option", { name: "Create new scenario..." }));

      const input = screen.getByLabelText(/scenario name/i);
      expect(input).toHaveFocus();
    });
  });

  describe("Creation", () => {
    it("calls onCreateScenario with trimmed name when Create is clicked", async () => {
      const user = userEvent.setup();
      const mockOnValueChange = vi.fn();
      const mockOnCreateScenario = vi.fn().mockReturnValue("new-scenario-id");

      render(
        <ScenarioSelect
          scenarios={mockScenarios}
          value="none"
          onValueChange={mockOnValueChange}
          onCreateScenario={mockOnCreateScenario}
        />
      );

      await user.click(screen.getByRole("combobox", { name: /scenario/i }));
      await user.click(screen.getByRole("option", { name: "Create new scenario..." }));

      const input = screen.getByLabelText(/scenario name/i);
      await user.type(input, "  New Scenario  ");
      await user.click(screen.getByRole("button", { name: /create/i }));

      expect(mockOnCreateScenario).toHaveBeenCalledWith("New Scenario");
    });

    it("calls onValueChange with returned ID after creation", async () => {
      const user = userEvent.setup();
      const mockOnValueChange = vi.fn();
      const mockOnCreateScenario = vi.fn().mockReturnValue("new-scenario-id");

      render(
        <ScenarioSelect
          scenarios={mockScenarios}
          value="none"
          onValueChange={mockOnValueChange}
          onCreateScenario={mockOnCreateScenario}
        />
      );

      await user.click(screen.getByRole("combobox", { name: /scenario/i }));
      await user.click(screen.getByRole("option", { name: "Create new scenario..." }));

      const input = screen.getByLabelText(/scenario name/i);
      await user.type(input, "New Scenario");
      await user.click(screen.getByRole("button", { name: /create/i }));

      expect(mockOnValueChange).toHaveBeenCalledWith("new-scenario-id");
    });

    it("reverts to select mode after creation", async () => {
      const user = userEvent.setup();
      const mockOnValueChange = vi.fn();
      const mockOnCreateScenario = vi.fn().mockReturnValue("new-scenario-id");

      render(
        <ScenarioSelect
          scenarios={mockScenarios}
          value="none"
          onValueChange={mockOnValueChange}
          onCreateScenario={mockOnCreateScenario}
        />
      );

      await user.click(screen.getByRole("combobox", { name: /scenario/i }));
      await user.click(screen.getByRole("option", { name: "Create new scenario..." }));

      const input = screen.getByLabelText(/scenario name/i);
      await user.type(input, "New Scenario");
      await user.click(screen.getByRole("button", { name: /create/i }));

      expect(screen.queryByLabelText(/scenario name/i)).not.toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: /scenario/i })).toBeInTheDocument();
    });
  });

  describe("Validation", () => {
    it("Create button is disabled when name is empty", async () => {
      const user = userEvent.setup();
      const mockOnValueChange = vi.fn();
      const mockOnCreateScenario = vi.fn();

      render(
        <ScenarioSelect
          scenarios={mockScenarios}
          value="none"
          onValueChange={mockOnValueChange}
          onCreateScenario={mockOnCreateScenario}
        />
      );

      await user.click(screen.getByRole("combobox", { name: /scenario/i }));
      await user.click(screen.getByRole("option", { name: "Create new scenario..." }));

      const createButton = screen.getByRole("button", { name: /create/i });
      expect(createButton).toBeDisabled();
    });

    it("Create button is disabled when name is whitespace only", async () => {
      const user = userEvent.setup();
      const mockOnValueChange = vi.fn();
      const mockOnCreateScenario = vi.fn();

      render(
        <ScenarioSelect
          scenarios={mockScenarios}
          value="none"
          onValueChange={mockOnValueChange}
          onCreateScenario={mockOnCreateScenario}
        />
      );

      await user.click(screen.getByRole("combobox", { name: /scenario/i }));
      await user.click(screen.getByRole("option", { name: "Create new scenario..." }));

      const input = screen.getByLabelText(/scenario name/i);
      await user.type(input, "   ");

      const createButton = screen.getByRole("button", { name: /create/i });
      expect(createButton).toBeDisabled();
    });

    it("does not call onCreateScenario when Enter is pressed with empty name", async () => {
      const user = userEvent.setup();
      const mockOnValueChange = vi.fn();
      const mockOnCreateScenario = vi.fn();

      render(
        <ScenarioSelect
          scenarios={mockScenarios}
          value="none"
          onValueChange={mockOnValueChange}
          onCreateScenario={mockOnCreateScenario}
        />
      );

      await user.click(screen.getByRole("combobox", { name: /scenario/i }));
      await user.click(screen.getByRole("option", { name: "Create new scenario..." }));

      await user.keyboard("{Enter}");

      expect(mockOnCreateScenario).not.toHaveBeenCalled();
      expect(mockOnValueChange).not.toHaveBeenCalled();
    });

    it("does not call onCreateScenario when Enter is pressed with whitespace-only name", async () => {
      const user = userEvent.setup();
      const mockOnValueChange = vi.fn();
      const mockOnCreateScenario = vi.fn();

      render(
        <ScenarioSelect
          scenarios={mockScenarios}
          value="none"
          onValueChange={mockOnValueChange}
          onCreateScenario={mockOnCreateScenario}
        />
      );

      await user.click(screen.getByRole("combobox", { name: /scenario/i }));
      await user.click(screen.getByRole("option", { name: "Create new scenario..." }));

      const input = screen.getByLabelText(/scenario name/i);
      await user.type(input, "   ");
      await user.keyboard("{Enter}");

      expect(mockOnCreateScenario).not.toHaveBeenCalled();
      expect(mockOnValueChange).not.toHaveBeenCalled();
    });
  });

  describe("Keyboard", () => {
    it("submits on Enter key", async () => {
      const user = userEvent.setup();
      const mockOnValueChange = vi.fn();
      const mockOnCreateScenario = vi.fn().mockReturnValue("new-scenario-id");

      render(
        <ScenarioSelect
          scenarios={mockScenarios}
          value="none"
          onValueChange={mockOnValueChange}
          onCreateScenario={mockOnCreateScenario}
        />
      );

      await user.click(screen.getByRole("combobox", { name: /scenario/i }));
      await user.click(screen.getByRole("option", { name: "Create new scenario..." }));

      const input = screen.getByLabelText(/scenario name/i);
      await user.type(input, "New Scenario");
      await user.keyboard("{Enter}");

      expect(mockOnCreateScenario).toHaveBeenCalledWith("New Scenario");
      expect(mockOnValueChange).toHaveBeenCalledWith("new-scenario-id");
    });

    it("Enter does not propagate to parent form", async () => {
      const user = userEvent.setup();
      const mockOnValueChange = vi.fn();
      const mockOnCreateScenario = vi.fn().mockReturnValue("new-scenario-id");
      const mockFormSubmit = vi.fn((e) => e.preventDefault());

      render(
        <form onSubmit={mockFormSubmit}>
          <ScenarioSelect
            scenarios={mockScenarios}
            value="none"
            onValueChange={mockOnValueChange}
            onCreateScenario={mockOnCreateScenario}
          />
        </form>
      );

      await user.click(screen.getByRole("combobox", { name: /scenario/i }));
      await user.click(screen.getByRole("option", { name: "Create new scenario..." }));

      const input = screen.getByLabelText(/scenario name/i);
      await user.type(input, "New Scenario");
      await user.keyboard("{Enter}");

      expect(mockFormSubmit).not.toHaveBeenCalled();
    });

    it("cancels on Escape key", async () => {
      const user = userEvent.setup();
      const mockOnValueChange = vi.fn();
      const mockOnCreateScenario = vi.fn();

      render(
        <ScenarioSelect
          scenarios={mockScenarios}
          value="none"
          onValueChange={mockOnValueChange}
          onCreateScenario={mockOnCreateScenario}
        />
      );

      await user.click(screen.getByRole("combobox", { name: /scenario/i }));
      await user.click(screen.getByRole("option", { name: "Create new scenario..." }));

      const input = screen.getByLabelText(/scenario name/i);
      await user.type(input, "New Scenario");
      await user.keyboard("{Escape}");

      expect(screen.queryByLabelText(/scenario name/i)).not.toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: /scenario/i })).toBeInTheDocument();
      expect(mockOnCreateScenario).not.toHaveBeenCalled();
    });
  });

  describe("Cancel", () => {
    it("reverts to select mode when Cancel is clicked", async () => {
      const user = userEvent.setup();
      const mockOnValueChange = vi.fn();
      const mockOnCreateScenario = vi.fn();

      render(
        <ScenarioSelect
          scenarios={mockScenarios}
          value="none"
          onValueChange={mockOnValueChange}
          onCreateScenario={mockOnCreateScenario}
        />
      );

      await user.click(screen.getByRole("combobox", { name: /scenario/i }));
      await user.click(screen.getByRole("option", { name: "Create new scenario..." }));

      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(screen.queryByLabelText(/scenario name/i)).not.toBeInTheDocument();
      expect(screen.getByRole("combobox", { name: /scenario/i })).toBeInTheDocument();
    });

    it("maintains previous selection after canceling", async () => {
      const user = userEvent.setup();
      const mockOnValueChange = vi.fn();
      const mockOnCreateScenario = vi.fn();

      render(
        <ScenarioSelect
          scenarios={mockScenarios}
          value="scenario-1"
          onValueChange={mockOnValueChange}
          onCreateScenario={mockOnCreateScenario}
        />
      );

      await user.click(screen.getByRole("combobox", { name: /scenario/i }));
      await user.click(screen.getByRole("option", { name: "Create new scenario..." }));

      const input = screen.getByLabelText(/scenario name/i);
      await user.type(input, "New Scenario");
      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(mockOnValueChange).not.toHaveBeenCalled();
    });

    it("clears input when re-entering create mode", async () => {
      const user = userEvent.setup();
      const mockOnValueChange = vi.fn();
      const mockOnCreateScenario = vi.fn();

      render(
        <ScenarioSelect
          scenarios={mockScenarios}
          value="none"
          onValueChange={mockOnValueChange}
          onCreateScenario={mockOnCreateScenario}
        />
      );

      await user.click(screen.getByRole("combobox", { name: /scenario/i }));
      await user.click(screen.getByRole("option", { name: "Create new scenario..." }));

      const input = screen.getByLabelText(/scenario name/i);
      await user.type(input, "Old Name");
      await user.click(screen.getByRole("button", { name: /cancel/i }));

      await user.click(screen.getByRole("combobox", { name: /scenario/i }));
      await user.click(screen.getByRole("option", { name: "Create new scenario..." }));

      const newInput = screen.getByLabelText(/scenario name/i);
      expect(newInput).toHaveValue("");
    });
  });
});

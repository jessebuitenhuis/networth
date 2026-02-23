import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Scenario } from "@/scenarios/Scenario.type";

import { ScenarioSelectPage } from "./ScenarioSelect.page";

const mockScenarios: Scenario[] = [
  { id: "scenario-1", name: "Retirement" },
  { id: "scenario-2", name: "House Purchase" },
];

function renderPage(value = "none") {
  const onValueChange = vi.fn();
  const onCreateScenario = vi.fn();
  const page = ScenarioSelectPage.render({
    scenarios: mockScenarios,
    value,
    onValueChange,
    onCreateScenario,
  });
  return { page, onValueChange, onCreateScenario };
}

describe("ScenarioSelect", () => {
  describe("Rendering", () => {
    it("renders combobox with Scenario aria-label", () => {
      const { page } = renderPage();

      expect(page.trigger).toBeInTheDocument();
    });

    it("shows None (Baseline) and existing scenarios when opened", async () => {
      const { page } = renderPage();

      await page.open();

      expect(screen.getByRole("option", { name: "None (Baseline)" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Retirement" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "House Purchase" })).toBeInTheDocument();
    });

    it('shows "Create new scenario..." as last option', async () => {
      const { page } = renderPage();

      await page.open();

      const options = page.allOptions;
      expect(options[options.length - 1]).toHaveTextContent("Create new scenario...");
    });
  });

  describe("Selection", () => {
    it("calls onValueChange when selecting an existing scenario", async () => {
      const { page, onValueChange } = renderPage();

      await page.selectScenario("Retirement");

      expect(onValueChange).toHaveBeenCalledWith("scenario-1");
    });

    it("calls onValueChange when selecting None (Baseline)", async () => {
      const { page, onValueChange } = renderPage("scenario-1");

      await page.selectScenario("None (Baseline)");

      expect(onValueChange).toHaveBeenCalledWith("none");
    });
  });

  describe("Mode switch", () => {
    it('switches to create mode when "Create new scenario..." is selected', async () => {
      const { page } = renderPage();

      await page.enterCreateMode();

      expect(page.scenarioNameInput).toBeInTheDocument();
      expect(page.createButton).toBeInTheDocument();
      expect(page.cancelButton).toBeInTheDocument();
    });

    it("does not call onValueChange when entering create mode", async () => {
      const { page, onValueChange } = renderPage();

      await page.enterCreateMode();

      expect(onValueChange).not.toHaveBeenCalled();
    });

    it("auto-focuses the input in create mode", async () => {
      const { page } = renderPage();

      await page.enterCreateMode();

      expect(page.scenarioNameInput).toHaveFocus();
    });
  });

  describe("Creation", () => {
    it("calls onCreateScenario with trimmed name when Create is clicked", async () => {
      const { page, onCreateScenario } = renderPage();
      onCreateScenario.mockReturnValue("new-scenario-id");

      await page.enterCreateMode();
      await page.typeScenarioName("  New Scenario  ");
      await page.clickCreate();

      expect(onCreateScenario).toHaveBeenCalledWith("New Scenario");
    });

    it("calls onValueChange with returned ID after creation", async () => {
      const { page, onValueChange, onCreateScenario } = renderPage();
      onCreateScenario.mockReturnValue("new-scenario-id");

      await page.enterCreateMode();
      await page.typeScenarioName("New Scenario");
      await page.clickCreate();

      expect(onValueChange).toHaveBeenCalledWith("new-scenario-id");
    });

    it("reverts to select mode after creation", async () => {
      const { page, onCreateScenario } = renderPage();
      onCreateScenario.mockReturnValue("new-scenario-id");

      await page.enterCreateMode();
      await page.typeScenarioName("New Scenario");
      await page.clickCreate();

      expect(page.queryScenarioNameInput()).not.toBeInTheDocument();
      expect(page.queryTrigger()).toBeInTheDocument();
    });
  });

  describe("Validation", () => {
    it("Create button is disabled when name is empty", async () => {
      const { page } = renderPage();

      await page.enterCreateMode();

      expect(page.createButton).toBeDisabled();
    });

    it("Create button is disabled when name is whitespace only", async () => {
      const { page } = renderPage();

      await page.enterCreateMode();
      await page.typeScenarioName("   ");

      expect(page.createButton).toBeDisabled();
    });

    it("does not call onCreateScenario when Enter is pressed with empty name", async () => {
      const { page, onCreateScenario, onValueChange } = renderPage();

      await page.enterCreateMode();
      await page.pressKey("{Enter}");

      expect(onCreateScenario).not.toHaveBeenCalled();
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it("does not call onCreateScenario when Enter is pressed with whitespace-only name", async () => {
      const { page, onCreateScenario, onValueChange } = renderPage();

      await page.enterCreateMode();
      await page.typeScenarioName("   ");
      await page.pressKey("{Enter}");

      expect(onCreateScenario).not.toHaveBeenCalled();
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe("Keyboard", () => {
    it("submits on Enter key", async () => {
      const { page, onCreateScenario, onValueChange } = renderPage();
      onCreateScenario.mockReturnValue("new-scenario-id");

      await page.enterCreateMode();
      await page.typeScenarioName("New Scenario");
      await page.pressKey("{Enter}");

      expect(onCreateScenario).toHaveBeenCalledWith("New Scenario");
      expect(onValueChange).toHaveBeenCalledWith("new-scenario-id");
    });

    it("Enter does not propagate to parent form", async () => {
      const onValueChange = vi.fn();
      const onCreateScenario = vi.fn().mockReturnValue("new-scenario-id");
      const mockFormSubmit = vi.fn((e) => e.preventDefault());

      const page = ScenarioSelectPage.render({
        scenarios: mockScenarios,
        value: "none",
        onValueChange,
        onCreateScenario,
        formOnSubmit: mockFormSubmit,
      });

      await page.enterCreateMode();
      await page.typeScenarioName("New Scenario");
      await page.pressKey("{Enter}");

      expect(mockFormSubmit).not.toHaveBeenCalled();
    });

    it("cancels on Escape key", async () => {
      const { page, onCreateScenario } = renderPage();

      await page.enterCreateMode();
      await page.typeScenarioName("New Scenario");
      await page.pressKey("{Escape}");

      expect(page.queryScenarioNameInput()).not.toBeInTheDocument();
      expect(page.queryTrigger()).toBeInTheDocument();
      expect(onCreateScenario).not.toHaveBeenCalled();
    });
  });

  describe("Cancel", () => {
    it("reverts to select mode when Cancel is clicked", async () => {
      const { page } = renderPage();

      await page.enterCreateMode();
      await page.clickCancel();

      expect(page.queryScenarioNameInput()).not.toBeInTheDocument();
      expect(page.queryTrigger()).toBeInTheDocument();
    });

    it("maintains previous selection after canceling", async () => {
      const { page, onValueChange } = renderPage("scenario-1");

      await page.enterCreateMode();
      await page.typeScenarioName("New Scenario");
      await page.clickCancel();

      expect(onValueChange).not.toHaveBeenCalled();
    });

    it("clears input when re-entering create mode", async () => {
      const { page } = renderPage();

      await page.enterCreateMode();
      await page.typeScenarioName("Old Name");
      await page.clickCancel();

      await page.enterCreateMode();

      expect(page.scenarioNameInput).toHaveValue("");
    });
  });
});

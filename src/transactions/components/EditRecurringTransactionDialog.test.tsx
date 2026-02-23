import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EditRecurringTransactionDialogPage } from "./EditRecurringTransactionDialog.page";

describe("EditRecurringTransactionDialog", () => {
  it("opens dialog with current values pre-populated", async () => {
    const page = EditRecurringTransactionDialogPage.render();
    await page.open();

    expect(page.amountInput).toHaveValue("5,000");
    expect(page.descriptionInput).toHaveValue("Salary");
    expect(page.startDateInput).toHaveValue("2024-01-15");
    expect(page.endDateInput).toHaveValue("2024-12-31");
    expect(page.frequencySelect).toBeInTheDocument();
  });

  it("calls onSave with updated recurring transaction when saving", async () => {
    const page = EditRecurringTransactionDialogPage.render();
    await page.open();
    await page.fillAmount("6000");
    await page.fillDescription("Updated salary");
    await page.fillStartDate("2024-02-01");
    await page.save();

    expect(page.onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "r1",
        amount: 6000,
        description: "Updated salary",
        startDate: "2024-02-01",
      }),
    );
  });

  it("prevents submit when amount is 0", async () => {
    const page = EditRecurringTransactionDialogPage.render();
    await page.open();
    await page.fillAmount("0");
    await page.save();

    expect(page.onSave).not.toHaveBeenCalled();
    expect(page.queryDialog()).toBeInTheDocument();
  });

  it("closes edit dialog before showing delete confirmation", async () => {
    const page = EditRecurringTransactionDialogPage.render();
    await page.open();
    await page.clickDelete();

    expect(page.queryAmountInput()).not.toBeInTheDocument();
    expect(screen.getByText("Delete Recurring Transaction")).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete this recurring transaction/),
    ).toBeInTheDocument();
  });

  it("delete confirmation button uses destructive variant", async () => {
    const page = EditRecurringTransactionDialogPage.render();
    await page.open();
    await page.clickDelete();

    expect(page.confirmDeleteButton).toHaveClass("bg-destructive");
  });

  it("calls onDelete with recurring transaction id when confirming delete", async () => {
    const page = EditRecurringTransactionDialogPage.render();
    await page.open();
    await page.clickDelete();
    await page.confirmDelete();

    expect(page.onDelete).toHaveBeenCalledWith("r1");
  });

  it("returns to edit dialog when canceling delete", async () => {
    const page = EditRecurringTransactionDialogPage.render();
    await page.open();
    await page.clickDelete();

    expect(page.queryEditHeading()).not.toBeInTheDocument();

    await page.cancelDelete();

    expect(page.queryDeleteHeading()).not.toBeInTheDocument();
    expect(screen.getByText("Edit Recurring Transaction")).toBeInTheDocument();
    expect(page.amountInput).toBeInTheDocument();
  });

  it("resets form when reopening dialog", async () => {
    const page = EditRecurringTransactionDialogPage.render();
    await page.open();
    await page.fillAmount("10000");
    await page.closeWithEscape();
    await page.open();

    expect(page.amountInput).toHaveValue("5,000");
  });

  it("calls onSave with updated end date", async () => {
    const page = EditRecurringTransactionDialogPage.render();
    await page.open();
    await page.fillEndDate("2025-06-30");
    await page.save();

    expect(page.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ endDate: "2025-06-30" }),
    );
  });

  it("calls onSave with scenarioId when selecting a scenario", async () => {
    const page = EditRecurringTransactionDialogPage.render({
      scenarios: [{ id: "s1", name: "Test Scenario" }],
    });
    await page.open();
    await page.selectScenario("Test Scenario");
    await page.save();

    expect(page.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ scenarioId: "s1" }),
    );
  });

  it('shows "Create new scenario..." option in scenario dropdown', async () => {
    const page = EditRecurringTransactionDialogPage.render();
    await page.open();
    await page.openScenarioDropdown();

    expect(screen.getByRole("option", { name: "Create new scenario..." })).toBeInTheDocument();
  });

  it("creates scenario inline and auto-selects it", async () => {
    const page = EditRecurringTransactionDialogPage.render();
    await page.open();
    await page.createScenarioInline("Early Retirement");

    expect(page.onCreateScenario).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Early Retirement" }),
    );
    const createdScenarioId = page.onCreateScenario.mock.calls[0][0].id;

    await page.save();

    expect(page.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ scenarioId: createdScenarioId }),
    );
  });
});

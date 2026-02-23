import { act, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EditTransactionDialogPage } from "./EditTransactionDialog.page";

describe("EditTransactionDialog", () => {
  it("opens dialog with current values pre-populated", async () => {
    const page = EditTransactionDialogPage.render();
    await page.open();

    expect(page.amountInput).toHaveValue("1,000");
    expect(page.dateInput).toHaveValue("2024-01-15");
    expect(page.descriptionInput).toHaveValue("Test transaction");
  });

  it("calls onSave with updated transaction when saving", async () => {
    const page = EditTransactionDialogPage.render();
    await page.open();
    await page.fillAmount("1500");
    await page.fillDate("2024-01-20");
    await page.fillDescription("Updated transaction");
    await page.save();

    expect(page.onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "t1",
        amount: 1500,
        date: "2024-01-20",
        description: "Updated transaction",
      }),
    );
  });

  it("prevents submit when amount is 0", async () => {
    const page = EditTransactionDialogPage.render();
    await page.open();
    await page.fillAmount("0");
    await page.save();

    expect(page.onSave).not.toHaveBeenCalled();
    expect(page.queryDialog()).toBeInTheDocument();
  });

  it("closes edit dialog before showing delete confirmation", async () => {
    const page = EditTransactionDialogPage.render();
    await page.open();
    await page.clickDelete();

    expect(page.queryAmountInput()).not.toBeInTheDocument();
    expect(screen.getByText("Delete Transaction")).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to delete this transaction/),
    ).toBeInTheDocument();
  });

  it("delete confirmation button uses destructive variant", async () => {
    const page = EditTransactionDialogPage.render();
    await page.open();
    await page.clickDelete();

    expect(page.confirmDeleteButton).toHaveClass("bg-destructive");
  });

  it("calls onDelete with transaction id when confirming delete", async () => {
    const page = EditTransactionDialogPage.render();
    await page.open();
    await page.clickDelete();
    await page.confirmDelete();

    expect(page.onDelete).toHaveBeenCalledWith("t1");
  });

  it("returns to edit dialog when canceling delete", async () => {
    const page = EditTransactionDialogPage.render();
    await page.open();
    await page.clickDelete();

    expect(page.queryEditHeading()).not.toBeInTheDocument();

    await page.cancelDelete();

    expect(page.queryDeleteHeading()).not.toBeInTheDocument();
    expect(screen.getByText("Edit Transaction")).toBeInTheDocument();
    expect(page.amountInput).toBeInTheDocument();
  });

  it("resets form when reopening dialog", async () => {
    const page = EditTransactionDialogPage.render();
    await page.open();

    const amountInput = page.amountInput as HTMLInputElement;
    act(() => {
      amountInput.value = "5000";
      amountInput.dispatchEvent(new Event("change", { bubbles: true }));
    });

    await page.closeWithEscape();
    await page.open();

    expect(page.amountInput).toHaveValue("1,000");
  });

  it("trims whitespace from description when saving", async () => {
    const page = EditTransactionDialogPage.render();
    await page.open();
    await page.fillDescription("  Padded Description  ");
    await page.save();

    expect(page.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ description: "Padded Description" }),
    );
  });

  it("calls onSave with scenarioId when selecting a scenario", async () => {
    const page = EditTransactionDialogPage.render({
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
    const page = EditTransactionDialogPage.render();
    await page.open();
    await page.openScenarioDropdown();

    expect(screen.getByRole("option", { name: "Create new scenario..." })).toBeInTheDocument();
  });

  it("creates scenario inline and auto-selects it", async () => {
    const page = EditTransactionDialogPage.render();
    await page.open();
    await page.createScenarioInline("Retirement Plan");

    expect(page.onCreateScenario).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Retirement Plan" }),
    );
    const createdScenarioId = page.onCreateScenario.mock.calls[0][0].id;

    await page.save();

    expect(page.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ scenarioId: createdScenarioId }),
    );
  });
});

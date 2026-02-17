import { beforeEach, describe, expect, it } from "vitest";

import { CreateGoalDialogPage } from "./CreateGoalDialog.page";

describe("CreateGoalDialog", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders trigger button", () => {
    const page = CreateGoalDialogPage.render();
    expect(page.triggerButton).toBeInTheDocument();
  });

  it("opens dialog when trigger is clicked", async () => {
    const page = CreateGoalDialogPage.render();
    await page.open();
    expect(page.dialog).toBeInTheDocument();
  });

  it("creates goal with name and target amount", async () => {
    const page = CreateGoalDialogPage.render();

    await page.open();
    await page.fillName("Emergency Fund");
    await page.fillTargetAmount("10000");
    await page.submit();

    expect(page.goalsList).toHaveTextContent("Emergency Fund - 10000");
  });

  it("closes dialog after submit", async () => {
    const page = CreateGoalDialogPage.render();

    await page.open();
    await page.fillName("FIRE Goal");
    await page.fillTargetAmount("500000");
    await page.submit();

    expect(page.queryDialog()).not.toBeInTheDocument();
  });

  it("resets form when dialog is reopened", async () => {
    const page = CreateGoalDialogPage.render();

    await page.open();
    await page.fillName("Test Goal");
    await page.fillTargetAmount("1000");
    await page.pressEscape();

    await page.open();
    expect(page.nameInput).toHaveValue("");
    expect(page.targetAmountInput).toHaveValue("0");
  });

  it("disables submit button when name is empty", async () => {
    const page = CreateGoalDialogPage.render();

    await page.open();
    expect(page.submitButton).toBeDisabled();
  });

  it("trims whitespace from goal name", async () => {
    const page = CreateGoalDialogPage.render();

    await page.open();
    await page.fillName("  Padded Name  ");
    await page.fillTargetAmount("5000");
    await page.submit();

    expect(page.goalsList).toHaveTextContent("Padded Name - 5000");
  });

  it("closes via Escape key", async () => {
    const page = CreateGoalDialogPage.render();

    await page.open();
    await page.fillName("Test");
    await page.pressEscape();

    expect(page.queryDialog()).not.toBeInTheDocument();
  });
});

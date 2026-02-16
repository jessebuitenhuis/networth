import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EditGoalDialogPage } from "./EditGoalDialog.page";
import type { Goal } from "./Goal.type";

const goal: Goal = {
  id: "1",
  name: "Emergency Fund",
  targetAmount: 10000,
};

const mockFetch = vi.fn();

describe("EditGoalDialog", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  it("renders pencil trigger with correct aria-label", () => {
    const page = EditGoalDialogPage.render();
    expect(page.triggerButton).toBeInTheDocument();
  });

  it("opens dialog showing current name and target amount", async () => {
    const page = EditGoalDialogPage.render();
    await page.open();
    expect(page.dialog).toBeInTheDocument();
    expect(page.nameInput).toHaveValue("Emergency Fund");
    expect(page.targetAmountInput).toHaveValue("10,000");
  });

  it("editing name and saving updates the goal", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => [goal] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...goal, name: "FIRE Goal" }) });
    const page = EditGoalDialogPage.render();
    await screen.findByText("Emergency Fund - 10000");
    await page.open();
    await page.clearAndFillName("FIRE Goal");
    await page.save();
    expect(page.goalsList).toHaveTextContent("FIRE Goal - 10000");
    expect(page.queryDialog()).not.toBeInTheDocument();
  });

  it("editing target amount and saving updates the goal", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => [goal] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ...goal, targetAmount: 15000 }) });
    const page = EditGoalDialogPage.render();
    await screen.findByText("Emergency Fund - 10000");
    await page.open();
    await page.clearAndFillTargetAmount("15000");
    await page.save();
    expect(page.goalsList).toHaveTextContent("Emergency Fund - 15000");
  });

  it("empty name prevents submit", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [goal] });
    const page = EditGoalDialogPage.render();
    await screen.findByText("Emergency Fund - 10000");
    await page.open();
    await page.clearAndFillName("");
    await page.save();
    expect(page.dialog).toBeInTheDocument();
    expect(page.goalsList).toHaveTextContent("Emergency Fund - 10000");
  });

  it("delete button shows confirmation dialog", async () => {
    const page = EditGoalDialogPage.render();
    await page.open();
    await page.clickDelete();
    expect(page.queryDialog()).not.toBeInTheDocument();
    expect(page.getDeleteConfirmText()).toBeInTheDocument();
  });

  it("confirming delete removes the goal", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => [goal] })
      .mockResolvedValueOnce({ ok: true });
    const page = EditGoalDialogPage.render();
    await screen.findByText("Emergency Fund - 10000");
    await page.open();
    await page.clickDelete();
    await page.confirmDelete();
    expect(page.goalsList).toBeEmptyDOMElement();
  });

  it("resets form when dialog is reopened", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => [goal] });
    const page = EditGoalDialogPage.render();
    await screen.findByText("Emergency Fund - 10000");
    await page.open();
    await page.clearAndFillName("Changed");
    await page.pressEscape();
    await page.open();
    expect(page.nameInput).toHaveValue("Emergency Fund");
  });

  it("canceling delete returns to edit dialog", async () => {
    const page = EditGoalDialogPage.render();
    await page.open();
    await page.clickDelete();
    await page.cancelDelete();
    expect(page.queryDeleteConfirmText()).not.toBeInTheDocument();
    expect(page.dialog).toBeInTheDocument();
  });

  it("delete confirmation button uses destructive variant", async () => {
    const page = EditGoalDialogPage.render();
    await page.open();
    await page.clickDelete();
    expect(page.confirmDeleteButton).toHaveClass("bg-destructive");
  });
});

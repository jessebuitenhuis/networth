import { describe, expect, it } from "vitest";

import { suppressActWarnings } from "@/test/mocks/suppressActWarnings";

import { IncomeExpensesStepPage } from "./IncomeExpensesStep.page";

suppressActWarnings();

describe("IncomeExpensesStep", () => {
  it("renders income suggestion chips", () => {
    const page = IncomeExpensesStepPage.render();
    expect(page.getSuggestionButton("Salary")).toBeInTheDocument();
  });

  it("renders expense suggestion chips", () => {
    const page = IncomeExpensesStepPage.render();
    expect(page.getSuggestionButton("Groceries")).toBeInTheDocument();
  });

  it("calls onAdd when suggestion is clicked", async () => {
    const page = IncomeExpensesStepPage.render();
    await page.clickSuggestion("Salary");

    expect(page.onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        description: "Salary",
        accountTempId: "a1",
      }),
    );
  });

  it("hides suggestion after it is added", () => {
    const entries = [
      { tempId: "r1", description: "Salary", amount: 5000, accountTempId: "a1" },
    ];
    const page = IncomeExpensesStepPage.render(entries);
    expect(page.querySuggestionButton("Salary")).not.toBeInTheDocument();
  });

  it("calls onRemove when remove button is clicked", async () => {
    const entries = [
      { tempId: "r1", description: "Salary", amount: 5000, accountTempId: "a1" },
    ];
    const page = IncomeExpensesStepPage.render(entries);
    await page.clickRemove("Salary");
    expect(page.onRemove).toHaveBeenCalledWith("r1");
  });

  it("shows message when no accounts exist", () => {
    const page = IncomeExpensesStepPage.render([], []);
    expect(page.getText(/add accounts in the previous step/i)).toBeInTheDocument();
  });

  it("renders editable description input for added entries", () => {
    const entries = [
      { tempId: "r1", description: "Salary", amount: 5000, accountTempId: "a1" },
    ];
    const page = IncomeExpensesStepPage.render(entries);
    expect(page.getDescriptionInput("Salary")).toHaveValue("Salary");
  });

  it("calls onUpdate when description is edited", async () => {
    const entries = [
      { tempId: "r1", description: "Salary", amount: 5000, accountTempId: "a1" },
    ];
    const page = IncomeExpensesStepPage.render(entries);
    await page.editDescription("Salary", "Monthly Salary");
    expect(page.onUpdate).toHaveBeenCalledWith("r1", expect.objectContaining({ description: expect.any(String) }));
  });
});

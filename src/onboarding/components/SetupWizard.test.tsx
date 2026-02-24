import { beforeEach, describe, expect, it } from "vitest";

import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import { suppressActWarnings } from "@/test/mocks/suppressActWarnings";

import { SetupWizardPage } from "./SetupWizard.page";

suppressActWarnings();

describe("SetupWizard", () => {
  beforeEach(() => {
    mockApiResponses();
  });

  it("renders the first step", () => {
    const page = SetupWizardPage.render();
    expect(page.heading).toHaveTextContent("Add your accounts");
  });

  it("renders the progress bar", () => {
    const page = SetupWizardPage.render();
    expect(page.getProgressBar()).toBeInTheDocument();
  });

  it("disables back button on first step", () => {
    const page = SetupWizardPage.render();
    expect(page.getButton("Back")).toBeDisabled();
  });

  it("navigates to next step when Next is clicked", async () => {
    const page = SetupWizardPage.render();
    await page.clickButton("Next");
    expect(page.heading).toHaveTextContent(
      "Set up recurring income & expenses",
    );
  });

  it("navigates back when Back is clicked", async () => {
    const page = SetupWizardPage.render();
    await page.clickButton("Next");
    await page.clickButton("Back");
    expect(page.heading).toHaveTextContent("Add your accounts");
  });

  it("shows Finish button on last step", async () => {
    const page = SetupWizardPage.render();
    await page.clickButton("Next");
    await page.clickButton("Next");
    await page.clickButton("Next");
    expect(page.getButton("Finish")).toBeInTheDocument();
  });

  it("calls onFinish when Finish is clicked", async () => {
    const page = SetupWizardPage.render();
    await page.clickButton("Next");
    await page.clickButton("Next");
    await page.clickButton("Next");
    await page.clickButton("Finish");
    expect(page.onFinish).toHaveBeenCalled();
  });

  it("allows adding an account and navigating through steps", async () => {
    const page = SetupWizardPage.render();
    await page.clickSuggestion("Checking");
    expect(page.getNameInput("Checking")).toHaveValue("Checking");

    await page.clickButton("Next");
    expect(page.heading).toHaveTextContent(
      "Set up recurring income & expenses",
    );
  });
});

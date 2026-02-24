import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import { suppressActWarnings } from "@/test/mocks/suppressActWarnings";

import { SetupWizardPage } from "./SetupWizard.page";

suppressActWarnings();

describe("SetupWizard", () => {
  beforeEach(() => {
    mockPush.mockClear();
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

  it("allows skipping all steps and finishing", async () => {
    const page = SetupWizardPage.render();
    await page.clickButton("Next");
    await page.clickButton("Next");
    await page.clickButton("Next");
    await page.clickButton("Finish");
    expect(mockPush).toHaveBeenCalledWith("/planning");
  });

  it("allows adding an account and navigating through steps", async () => {
    const page = SetupWizardPage.render();
    await page.clickSuggestion("Checking");
    expect(page.getText("Checking")).toBeInTheDocument();

    await page.clickButton("Next");
    expect(page.heading).toHaveTextContent(
      "Set up recurring income & expenses",
    );
  });
});

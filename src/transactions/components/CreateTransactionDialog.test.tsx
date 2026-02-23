import { screen } from "@testing-library/react";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { mockResizeObserver } from "@/test/mocks/mockResizeObserver";

mockResizeObserver();

// Silence console.warn/error entirely for this test file.
// The combination of Dialog + Select Radix portals with async AccountProvider
// fetch generates cascading act() warnings that overflow the recursive spy
// in suppressActWarnings.
beforeAll(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

import { mockApiResponses } from "@/test/mocks/mockApiResponses";

import { CreateTransactionDialogPage } from "./CreateTransactionDialog.page";

describe("CreateTransactionDialog", () => {
  let uuidCounter = 0;

  beforeEach(() => {
    mockApiResponses();
    uuidCounter = 0;
    vi.stubGlobal("crypto", {
      randomUUID: () => `tx-uuid-${++uuidCounter}`,
    });
  });

  describe("with accountId", () => {
    it("renders trigger button", () => {
      const page = CreateTransactionDialogPage.render("a1");
      expect(page.triggerButton).toBeInTheDocument();
    });

    it("opens dialog on trigger click", async () => {
      const page = CreateTransactionDialogPage.render("a1");
      await page.open();

      expect(page.heading).toBeInTheDocument();
      expect(page.amountInput).toBeInTheDocument();
      expect(page.dateInput).toBeInTheDocument();
      expect(page.descriptionInput).toBeInTheDocument();
    });

    it("does not show account select", async () => {
      const page = CreateTransactionDialogPage.render("a1");
      await page.open();

      expect(page.queryAccountLabel()).not.toBeInTheDocument();
    });

    it("does not show recurrence fields by default", async () => {
      const page = CreateTransactionDialogPage.render("a1");
      await page.open();

      expect(page.queryFrequency()).not.toBeInTheDocument();
      expect(page.queryEndDate()).not.toBeInTheDocument();
    });

    it("shows recurrence fields when Recurring is checked", async () => {
      const page = CreateTransactionDialogPage.render("a1");
      await page.open();
      await page.toggleRecurring();

      expect(page.frequencySelect).toBeInTheDocument();
      expect(page.endDateInput).toBeInTheDocument();
    });

    it("adds a one-off transaction on submit", async () => {
      const page = CreateTransactionDialogPage.render("a1");
      await page.open();
      await page.fillAmount("250");
      await page.fillDescription("Groceries");
      await page.submit();

      expect(screen.getByText("Groceries - 250")).toBeInTheDocument();
    });

    it("adds a recurring transaction on submit when recurring is checked", async () => {
      const page = CreateTransactionDialogPage.render("a1");
      await page.open();
      await page.fillAmount("5000");
      await page.fillDescription("Salary");
      await page.toggleRecurring();
      await page.submit();

      expect(screen.getByText("Salary - 5000 - Monthly")).toBeInTheDocument();
      expect(page.transactionsList).toBeEmptyDOMElement();
    });

    it("does not submit with zero amount", async () => {
      const page = CreateTransactionDialogPage.render("a1");
      await page.open();
      await page.fillDescription("Nothing");
      await page.submit();

      expect(page.transactionsList).toBeEmptyDOMElement();
    });

    it("closes dialog after submit", async () => {
      const page = CreateTransactionDialogPage.render("a1");
      await page.open();
      await page.fillAmount("100");
      await page.fillDescription("Test");
      await page.submit();

      expect(page.queryHeading()).not.toBeInTheDocument();
    });

    it("adds a yearly recurring transaction with end date", async () => {
      const page = CreateTransactionDialogPage.render("a1");
      await page.open();
      await page.fillAmount("1200");
      await page.fillDescription("Insurance");
      await page.toggleRecurring();
      await page.selectFrequency("Yearly");
      await page.fillEndDate("2030-01-01");
      await page.submit();

      expect(screen.getByText("Insurance - 1200 - Yearly")).toBeInTheDocument();
    });

    it("resets form after submit", async () => {
      const page = CreateTransactionDialogPage.render("a1");
      await page.open();
      await page.fillAmount("250");
      await page.fillDescription("Groceries");
      await page.toggleRecurring();
      await page.submit();

      await page.open();

      expect(page.amountInput).toHaveValue("0");
      expect(page.descriptionInput).toHaveValue("");
      expect(page.recurringCheckbox).not.toBeChecked();
      expect(page.queryFrequency()).not.toBeInTheDocument();
    });

    it("trims whitespace from description", async () => {
      const page = CreateTransactionDialogPage.render("a1");
      await page.open();
      await page.fillAmount("100");
      await page.fillDescription("  Padded  ");
      await page.submit();

      expect(screen.getByText("Padded - 100")).toBeInTheDocument();
    });

    it("creates recurring transaction without end date", async () => {
      const page = CreateTransactionDialogPage.render("a1");
      await page.open();
      await page.fillAmount("500");
      await page.fillDescription("Subscription");
      await page.toggleRecurring();
      await page.submit();

      expect(screen.getByText("Subscription - 500 - Monthly")).toBeInTheDocument();
    });

    it("creates transaction with scenario selected", async () => {
      mockApiResponses({
        scenarios: [{ id: "scenario-1", name: "Test Scenario" }],
      });
      const page = CreateTransactionDialogPage.render("a1");
      await screen.findByText("Test Scenario");

      await page.open();
      await page.fillAmount("300");
      await page.fillDescription("Scenario TX");
      await page.selectScenario("Test Scenario");
      await page.submit();

      expect(screen.getByText("Scenario TX - 300")).toBeInTheDocument();
    });

    it('shows "Create new scenario..." option in scenario dropdown', async () => {
      const page = CreateTransactionDialogPage.render("a1");
      await page.open();
      await page.selectScenario("Create new scenario...");

      expect(screen.getByLabelText(/scenario name/i)).toBeInTheDocument();
    });

    it("creates scenario inline and auto-selects it", async () => {
      const page = CreateTransactionDialogPage.render("a1");
      await page.open();
      await page.createScenarioInline("New Planning");

      expect(page.scenariosList).toHaveTextContent("New Planning");

      await page.fillAmount("500");
      await page.fillDescription("Planning TX");
      await page.submit();

      expect(screen.getByText("Planning TX - 500")).toBeInTheDocument();
    });

    it("changes date when date input is modified", async () => {
      const page = CreateTransactionDialogPage.render("a1");
      await page.open();
      await page.fillDate("2024-06-15");
      await page.fillAmount("100");
      await page.fillDescription("Test");
      await page.submit();

      expect(screen.getByText("Test - 100")).toBeInTheDocument();
    });
  });

  describe("without accountId (dashboard)", () => {
    function setupDashboardAccounts() {
      mockApiResponses({
        accounts: [
          { id: "a1", name: "Checking", type: "Asset" },
          { id: "a2", name: "Savings", type: "Asset" },
        ],
      });
    }

    it("shows account select field", async () => {
      setupDashboardAccounts();
      const page = await CreateTransactionDialogPage.renderDashboard();
      await page.open();

      expect(page.accountLabel).toBeInTheDocument();
    });

    it("account select has no default value", async () => {
      setupDashboardAccounts();
      const page = await CreateTransactionDialogPage.renderDashboard();
      await page.open();

      expect(page.accountSelect).toHaveTextContent("Select account");
    });

    it("does not submit without selecting an account", async () => {
      setupDashboardAccounts();
      const page = await CreateTransactionDialogPage.renderDashboard();
      await page.open();
      await page.fillAmount("100");
      await page.fillDescription("Test");
      await page.submit();

      expect(page.transactionsList).toBeEmptyDOMElement();
    });

    it("creates transaction with selected account", async () => {
      setupDashboardAccounts();
      const page = await CreateTransactionDialogPage.renderDashboard();
      await page.open();
      await page.selectAccount("Savings");
      await page.fillAmount("250");
      await page.fillDescription("Groceries");
      await page.submit();

      expect(screen.getByText("a2 - Groceries - 250")).toBeInTheDocument();
    });

    it("creates recurring transaction with selected account", async () => {
      setupDashboardAccounts();
      const page = await CreateTransactionDialogPage.renderDashboard();
      await page.open();
      await page.selectAccount("Checking");
      await page.fillAmount("5000");
      await page.fillDescription("Salary");
      await page.toggleRecurring();
      await page.submit();

      expect(screen.getByText("a1 - Salary - 5000 - Monthly")).toBeInTheDocument();
    });

    it("resets account after submit", async () => {
      setupDashboardAccounts();
      const page = await CreateTransactionDialogPage.renderDashboard();
      await page.open();
      await page.selectAccount("Savings");
      await page.fillAmount("100");
      await page.submit();

      await page.open();
      expect(page.accountSelect).toHaveTextContent("Select account");
    });
  });
});

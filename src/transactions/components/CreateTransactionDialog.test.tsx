import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

import { AccountProvider, useAccounts } from "@/accounts/AccountContext";
import { CategoryProvider } from "@/categories/CategoryContext";
import {
  RecurringTransactionProvider,
  useRecurringTransactions,
} from "@/recurring-transactions/RecurringTransactionContext";
import { ScenarioProvider, useScenarios } from "@/scenarios/ScenarioContext";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import { TransactionProvider, useTransactions } from "@/transactions/TransactionContext";

import { CreateTransactionDialog } from "./CreateTransactionDialog";

function TestHarness({ accountId }: { accountId?: string }) {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const { recurringTransactions } = useRecurringTransactions();
  const { scenarios } = useScenarios();
  const filtered = accountId
    ? transactions.filter((t) => t.accountId === accountId)
    : transactions;
  return (
    <div>
      <CreateTransactionDialog accountId={accountId} />
      {accounts.length > 0 && <span data-testid="accounts-loaded" />}
      <ul data-testid="transactions">
        {filtered.map((t) => (
          <li key={t.id}>
            {accountId ? "" : `${t.accountId} - `}{t.description} - {t.amount}
          </li>
        ))}
      </ul>
      <ul data-testid="recurring">
        {recurringTransactions
          .filter((rt) => !accountId || rt.accountId === accountId)
          .map((rt) => (
            <li key={rt.id}>
              {accountId ? "" : `${rt.accountId} - `}{rt.description} - {rt.amount} - {rt.frequency}
            </li>
          ))}
      </ul>
      <ul data-testid="scenarios">
        {scenarios.map((s) => (
          <li key={s.id}>{s.name}</li>
        ))}
      </ul>
    </div>
  );
}

function renderDialog(accountId?: string) {
  return render(
    <AccountProvider>
      <TransactionProvider>
        <ScenarioProvider>
          <RecurringTransactionProvider>
            <CategoryProvider>
              <TestHarness accountId={accountId} />
            </CategoryProvider>
          </RecurringTransactionProvider>
        </ScenarioProvider>
      </TransactionProvider>
    </AccountProvider>
  );
}

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
      renderDialog("a1");
      expect(
        screen.getByRole("button", { name: "Add Transaction" })
      ).toBeInTheDocument();
    });

    it("opens dialog on trigger click", async () => {
      const user = userEvent.setup();
      renderDialog("a1");

      await user.click(
        screen.getByRole("button", { name: "Add Transaction" })
      );

      expect(
        screen.getByRole("heading", { name: "Add Transaction" })
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Amount")).toBeInTheDocument();
      expect(screen.getByLabelText("Date")).toBeInTheDocument();
      expect(screen.getByLabelText("Description")).toBeInTheDocument();
    });

    it("does not show account select", async () => {
      const user = userEvent.setup();
      renderDialog("a1");

      await user.click(
        screen.getByRole("button", { name: "Add Transaction" })
      );

      expect(screen.queryByLabelText("Account")).not.toBeInTheDocument();
    });

    it("does not show recurrence fields by default", async () => {
      const user = userEvent.setup();
      renderDialog("a1");

      await user.click(
        screen.getByRole("button", { name: "Add Transaction" })
      );

      expect(screen.queryByLabelText("Frequency")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("End Date")).not.toBeInTheDocument();
    });

    it("shows recurrence fields when Recurring is checked", async () => {
      const user = userEvent.setup();
      renderDialog("a1");

      await user.click(
        screen.getByRole("button", { name: "Add Transaction" })
      );
      await user.click(screen.getByRole("checkbox", { name: "Recurring" }));

      expect(screen.getByLabelText("Frequency")).toBeInTheDocument();
      expect(screen.getByLabelText("End Date")).toBeInTheDocument();
    });

    it("adds a one-off transaction on submit", async () => {
      const user = userEvent.setup();
      renderDialog("a1");

      await user.click(
        screen.getByRole("button", { name: "Add Transaction" })
      );
      await user.clear(screen.getByLabelText("Amount"));
      await user.type(screen.getByLabelText("Amount"), "250");
      await user.type(screen.getByLabelText("Description"), "Groceries");
      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(screen.getByText("Groceries - 250")).toBeInTheDocument();
    });

    it("adds a recurring transaction on submit when recurring is checked", async () => {
      const user = userEvent.setup();
      renderDialog("a1");

      await user.click(
        screen.getByRole("button", { name: "Add Transaction" })
      );
      await user.clear(screen.getByLabelText("Amount"));
      await user.type(screen.getByLabelText("Amount"), "5000");
      await user.type(screen.getByLabelText("Description"), "Salary");
      await user.click(screen.getByRole("checkbox", { name: "Recurring" }));
      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(screen.getByText("Salary - 5000 - Monthly")).toBeInTheDocument();
      expect(screen.getByTestId("transactions")).toBeEmptyDOMElement();
    });

    it("does not submit with zero amount", async () => {
      const user = userEvent.setup();
      renderDialog("a1");

      await user.click(
        screen.getByRole("button", { name: "Add Transaction" })
      );
      await user.type(screen.getByLabelText("Description"), "Nothing");
      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(screen.getByTestId("transactions")).toBeEmptyDOMElement();
    });

    it("closes dialog after submit", async () => {
      const user = userEvent.setup();
      renderDialog("a1");

      await user.click(
        screen.getByRole("button", { name: "Add Transaction" })
      );
      await user.clear(screen.getByLabelText("Amount"));
      await user.type(screen.getByLabelText("Amount"), "100");
      await user.type(screen.getByLabelText("Description"), "Test");
      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(
        screen.queryByRole("heading", { name: "Add Transaction" })
      ).not.toBeInTheDocument();
    });

    it("adds a yearly recurring transaction with end date", async () => {
      const user = userEvent.setup();
      renderDialog("a1");

      await user.click(
        screen.getByRole("button", { name: "Add Transaction" })
      );
      await user.clear(screen.getByLabelText("Amount"));
      await user.type(screen.getByLabelText("Amount"), "1200");
      await user.type(screen.getByLabelText("Description"), "Insurance");
      await user.click(screen.getByRole("checkbox", { name: "Recurring" }));

      await user.click(screen.getByRole("combobox", { name: "Frequency" }));
      await user.click(screen.getByRole("option", { name: "Yearly" }));

      await user.type(screen.getByLabelText("End Date"), "2030-01-01");

      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(
        screen.getByText("Insurance - 1200 - Yearly")
      ).toBeInTheDocument();
    });

    it("resets form after submit", async () => {
      const user = userEvent.setup();
      renderDialog("a1");

      await user.click(
        screen.getByRole("button", { name: "Add Transaction" })
      );
      await user.clear(screen.getByLabelText("Amount"));
      await user.type(screen.getByLabelText("Amount"), "250");
      await user.type(screen.getByLabelText("Description"), "Groceries");
      await user.click(screen.getByRole("checkbox", { name: "Recurring" }));
      await user.click(screen.getByRole("button", { name: "Submit" }));

      await user.click(
        screen.getByRole("button", { name: "Add Transaction" })
      );

      expect(screen.getByLabelText("Amount")).toHaveValue("0");
      expect(screen.getByLabelText("Description")).toHaveValue("");
      expect(
        screen.getByRole("checkbox", { name: "Recurring" })
      ).not.toBeChecked();
      expect(screen.queryByLabelText("Frequency")).not.toBeInTheDocument();
    });

    it("trims whitespace from description", async () => {
      const user = userEvent.setup();
      renderDialog("a1");

      await user.click(
        screen.getByRole("button", { name: "Add Transaction" })
      );
      await user.clear(screen.getByLabelText("Amount"));
      await user.type(screen.getByLabelText("Amount"), "100");
      await user.type(screen.getByLabelText("Description"), "  Padded  ");
      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(screen.getByText("Padded - 100")).toBeInTheDocument();
    });

    it("creates recurring transaction without end date", async () => {
      const user = userEvent.setup();
      renderDialog("a1");

      await user.click(
        screen.getByRole("button", { name: "Add Transaction" })
      );
      await user.clear(screen.getByLabelText("Amount"));
      await user.type(screen.getByLabelText("Amount"), "500");
      await user.type(screen.getByLabelText("Description"), "Subscription");
      await user.click(screen.getByRole("checkbox", { name: "Recurring" }));
      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(screen.getByText("Subscription - 500 - Monthly")).toBeInTheDocument();
    });

    it("creates transaction with scenario selected", async () => {
      const user = userEvent.setup();
      mockApiResponses({
        scenarios: [{ id: "scenario-1", name: "Test Scenario" }],
      });
      renderDialog("a1");

      await screen.findByText("Test Scenario");

      await user.click(
        screen.getByRole("button", { name: "Add Transaction" })
      );
      await user.clear(screen.getByLabelText("Amount"));
      await user.type(screen.getByLabelText("Amount"), "300");
      await user.type(screen.getByLabelText("Description"), "Scenario TX");

      await user.click(screen.getByRole("combobox", { name: "Scenario" }));
      await user.click(screen.getByRole("option", { name: "Test Scenario" }));

      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(screen.getByText("Scenario TX - 300")).toBeInTheDocument();
    });

    it('shows "Create new scenario..." option in scenario dropdown', async () => {
      const user = userEvent.setup();
      renderDialog("a1");

      await user.click(
        screen.getByRole("button", { name: "Add Transaction" })
      );

      await user.click(screen.getByRole("combobox", { name: "Scenario" }));

      expect(screen.getByRole("option", { name: "Create new scenario..." })).toBeInTheDocument();
    });

    it("creates scenario inline and auto-selects it", async () => {
      const user = userEvent.setup();
      renderDialog("a1");

      await user.click(
        screen.getByRole("button", { name: "Add Transaction" })
      );

      await user.click(screen.getByRole("combobox", { name: "Scenario" }));
      await user.click(screen.getByRole("option", { name: "Create new scenario..." }));

      const input = screen.getByLabelText(/scenario name/i);
      await user.type(input, "New Planning");
      await user.click(screen.getByRole("button", { name: /create/i }));

      expect(screen.getByTestId("scenarios")).toHaveTextContent("New Planning");

      await user.clear(screen.getByLabelText("Amount"));
      await user.type(screen.getByLabelText("Amount"), "500");
      await user.type(screen.getByLabelText("Description"), "Planning TX");
      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(screen.getByText("Planning TX - 500")).toBeInTheDocument();
    });

    it("changes date when date input is modified", async () => {
      const user = userEvent.setup();
      renderDialog("a1");

      await user.click(
        screen.getByRole("button", { name: "Add Transaction" })
      );

      const dateInput = screen.getByLabelText("Date");
      await user.clear(dateInput);
      await user.type(dateInput, "2024-06-15");

      await user.clear(screen.getByLabelText("Amount"));
      await user.type(screen.getByLabelText("Amount"), "100");
      await user.type(screen.getByLabelText("Description"), "Test");
      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(screen.getByText("Test - 100")).toBeInTheDocument();
    });
  });

  describe("without accountId (dashboard)", () => {
    async function renderDashboardDialog() {
      mockApiResponses({
        accounts: [
          { id: "a1", name: "Checking", type: "Asset" },
          { id: "a2", name: "Savings", type: "Asset" },
        ],
      });
      await act(async () => {
        renderDialog();
      });
      await screen.findByTestId("accounts-loaded");
    }

    it("shows account select field", async () => {
      const user = userEvent.setup();
      await renderDashboardDialog();

      await user.click(screen.getByRole("button", { name: "Add Transaction" }));

      expect(screen.getByLabelText("Account")).toBeInTheDocument();
    });

    it("account select has no default value", async () => {
      const user = userEvent.setup();
      await renderDashboardDialog();

      await user.click(screen.getByRole("button", { name: "Add Transaction" }));

      expect(screen.getByRole("combobox", { name: "Account" })).toHaveTextContent("Select account");
    });

    it("does not submit without selecting an account", async () => {
      const user = userEvent.setup();
      await renderDashboardDialog();

      await user.click(screen.getByRole("button", { name: "Add Transaction" }));
      await user.clear(screen.getByLabelText("Amount"));
      await user.type(screen.getByLabelText("Amount"), "100");
      await user.type(screen.getByLabelText("Description"), "Test");
      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(screen.getByTestId("transactions")).toBeEmptyDOMElement();
    });

    it("creates transaction with selected account", async () => {
      const user = userEvent.setup();
      await renderDashboardDialog();

      await user.click(screen.getByRole("button", { name: "Add Transaction" }));

      await user.click(screen.getByRole("combobox", { name: "Account" }));
      await user.click(screen.getByRole("option", { name: "Savings" }));

      await user.clear(screen.getByLabelText("Amount"));
      await user.type(screen.getByLabelText("Amount"), "250");
      await user.type(screen.getByLabelText("Description"), "Groceries");
      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(screen.getByText("a2 - Groceries - 250")).toBeInTheDocument();
    });

    it("creates recurring transaction with selected account", async () => {
      const user = userEvent.setup();
      await renderDashboardDialog();

      await user.click(screen.getByRole("button", { name: "Add Transaction" }));

      await user.click(screen.getByRole("combobox", { name: "Account" }));
      await user.click(screen.getByRole("option", { name: "Checking" }));

      await user.clear(screen.getByLabelText("Amount"));
      await user.type(screen.getByLabelText("Amount"), "5000");
      await user.type(screen.getByLabelText("Description"), "Salary");
      await user.click(screen.getByRole("checkbox", { name: "Recurring" }));
      await user.click(screen.getByRole("button", { name: "Submit" }));

      expect(screen.getByText("a1 - Salary - 5000 - Monthly")).toBeInTheDocument();
    });

    it("resets account after submit", async () => {
      const user = userEvent.setup();
      await renderDashboardDialog();

      await user.click(screen.getByRole("button", { name: "Add Transaction" }));

      await user.click(screen.getByRole("combobox", { name: "Account" }));
      await user.click(screen.getByRole("option", { name: "Savings" }));
      await user.clear(screen.getByLabelText("Amount"));
      await user.type(screen.getByLabelText("Amount"), "100");
      await user.click(screen.getByRole("button", { name: "Submit" }));

      await user.click(screen.getByRole("button", { name: "Add Transaction" }));
      expect(screen.getByRole("combobox", { name: "Account" })).toHaveTextContent("Select account");
    });
  });
});

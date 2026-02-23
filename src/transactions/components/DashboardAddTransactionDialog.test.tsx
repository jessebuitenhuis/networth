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
import { ScenarioProvider } from "@/scenarios/ScenarioContext";
import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import { TransactionProvider, useTransactions } from "@/transactions/TransactionContext";

import { DashboardAddTransactionDialog } from "./DashboardAddTransactionDialog";

function TestHarness() {
  const { accounts } = useAccounts();
  const { transactions } = useTransactions();
  const { recurringTransactions } = useRecurringTransactions();
  return (
    <div>
      <DashboardAddTransactionDialog />
      {accounts.length > 0 && <span data-testid="accounts-loaded" />}
      <ul data-testid="transactions">
        {transactions.map((t) => (
          <li key={t.id}>
            {t.accountId} - {t.description} - {t.amount}
          </li>
        ))}
      </ul>
      <ul data-testid="recurring">
        {recurringTransactions.map((rt) => (
          <li key={rt.id}>
            {rt.accountId} - {rt.description} - {rt.amount} - {rt.frequency}
          </li>
        ))}
      </ul>
    </div>
  );
}

async function renderDialog() {
  await act(async () => {
    render(
      <AccountProvider>
        <TransactionProvider>
          <ScenarioProvider>
            <RecurringTransactionProvider>
              <CategoryProvider>
                <TestHarness />
              </CategoryProvider>
            </RecurringTransactionProvider>
          </ScenarioProvider>
        </TransactionProvider>
      </AccountProvider>,
    );
  });
  await screen.findByTestId("accounts-loaded");
}

describe("DashboardAddTransactionDialog", () => {
  beforeEach(() => {
    mockApiResponses({
      accounts: [
        { id: "a1", name: "Checking", type: "Asset" },
        { id: "a2", name: "Savings", type: "Asset" },
      ],
    });
    vi.stubGlobal("crypto", {
      randomUUID: (() => {
        let c = 0;
        return () => `tx-uuid-${++c}`;
      })(),
    });
  });

  it("renders trigger button", async () => {
    await renderDialog();
    expect(
      screen.getByRole("button", { name: "Add Transaction" }),
    ).toBeInTheDocument();
  });

  it("opens dialog with account select field", async () => {
    const user = userEvent.setup();
    await renderDialog();

    await user.click(screen.getByRole("button", { name: "Add Transaction" }));

    expect(screen.getByRole("heading", { name: "Add Transaction" })).toBeInTheDocument();
    expect(screen.getByLabelText("Account")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount")).toBeInTheDocument();
  });

  it("account select has no default value", async () => {
    const user = userEvent.setup();
    await renderDialog();

    await user.click(screen.getByRole("button", { name: "Add Transaction" }));

    const accountTrigger = screen.getByRole("combobox", { name: "Account" });
    expect(accountTrigger).toHaveTextContent("Select account");
  });

  it("does not submit without selecting an account", async () => {
    const user = userEvent.setup();
    await renderDialog();

    await user.click(screen.getByRole("button", { name: "Add Transaction" }));
    await user.clear(screen.getByLabelText("Amount"));
    await user.type(screen.getByLabelText("Amount"), "100");
    await user.type(screen.getByLabelText("Description"), "Test");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(screen.getByTestId("transactions")).toBeEmptyDOMElement();
  });

  it("creates transaction with selected account", async () => {
    const user = userEvent.setup();
    await renderDialog();

    await user.click(screen.getByRole("button", { name: "Add Transaction" }));

    // Select account
    await user.click(screen.getByRole("combobox", { name: "Account" }));
    await user.click(screen.getByRole("option", { name: "Savings" }));

    // Fill form
    await user.clear(screen.getByLabelText("Amount"));
    await user.type(screen.getByLabelText("Amount"), "250");
    await user.type(screen.getByLabelText("Description"), "Groceries");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(screen.getByText("a2 - Groceries - 250")).toBeInTheDocument();
  });

  it("creates recurring transaction with selected account", async () => {
    const user = userEvent.setup();
    await renderDialog();

    await user.click(screen.getByRole("button", { name: "Add Transaction" }));

    // Select account
    await user.click(screen.getByRole("combobox", { name: "Account" }));
    await user.click(screen.getByRole("option", { name: "Checking" }));

    // Fill form
    await user.clear(screen.getByLabelText("Amount"));
    await user.type(screen.getByLabelText("Amount"), "5000");
    await user.type(screen.getByLabelText("Description"), "Salary");
    await user.click(screen.getByRole("checkbox", { name: "Recurring" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(screen.getByText("a1 - Salary - 5000 - Monthly")).toBeInTheDocument();
  });

  it("resets form including account after submit", async () => {
    const user = userEvent.setup();
    await renderDialog();

    await user.click(screen.getByRole("button", { name: "Add Transaction" }));

    // Select account and submit
    await user.click(screen.getByRole("combobox", { name: "Account" }));
    await user.click(screen.getByRole("option", { name: "Savings" }));
    await user.clear(screen.getByLabelText("Amount"));
    await user.type(screen.getByLabelText("Amount"), "100");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    // Reopen and verify account is reset
    await user.click(screen.getByRole("button", { name: "Add Transaction" }));
    expect(screen.getByRole("combobox", { name: "Account" })).toHaveTextContent("Select account");
  });

  it("closes dialog after submit", async () => {
    const user = userEvent.setup();
    await renderDialog();

    await user.click(screen.getByRole("button", { name: "Add Transaction" }));

    await user.click(screen.getByRole("combobox", { name: "Account" }));
    await user.click(screen.getByRole("option", { name: "Checking" }));
    await user.clear(screen.getByLabelText("Amount"));
    await user.type(screen.getByLabelText("Amount"), "100");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(
      screen.queryByRole("heading", { name: "Add Transaction" }),
    ).not.toBeInTheDocument();
  });
});

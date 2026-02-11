import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);

import { CreateTransactionDialog } from "./CreateTransactionDialog";
import { AccountProvider } from "@/context/AccountContext";
import { TransactionProvider, useTransactions } from "@/context/TransactionContext";
import { ScenarioProvider } from "@/context/ScenarioContext";
import {
  RecurringTransactionProvider,
  useRecurringTransactions,
} from "@/context/RecurringTransactionContext";

function TestHarness({ accountId }: { accountId: string }) {
  const { transactions } = useTransactions();
  const { recurringTransactions } = useRecurringTransactions();
  const filtered = transactions.filter((t) => t.accountId === accountId);
  return (
    <div>
      <CreateTransactionDialog accountId={accountId} />
      <ul data-testid="transactions">
        {filtered.map((t) => (
          <li key={t.id}>
            {t.description} - {t.amount}
          </li>
        ))}
      </ul>
      <ul data-testid="recurring">
        {recurringTransactions
          .filter((rt) => rt.accountId === accountId)
          .map((rt) => (
            <li key={rt.id}>
              {rt.description} - {rt.amount} - {rt.frequency}
            </li>
          ))}
      </ul>
    </div>
  );
}

function renderDialog(accountId = "a1") {
  return render(
    <AccountProvider>
      <TransactionProvider>
        <ScenarioProvider>
          <RecurringTransactionProvider>
            <TestHarness accountId={accountId} />
          </RecurringTransactionProvider>
        </ScenarioProvider>
      </TransactionProvider>
    </AccountProvider>
  );
}

describe("CreateTransactionDialog", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("crypto", {
      randomUUID: () => "tx-uuid",
    });
  });

  it("renders trigger button", () => {
    renderDialog();
    expect(
      screen.getByRole("button", { name: "Add Transaction" })
    ).toBeInTheDocument();
  });

  it("opens dialog on trigger click", async () => {
    const user = userEvent.setup();
    renderDialog();

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

  it("does not show recurrence fields by default", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(
      screen.getByRole("button", { name: "Add Transaction" })
    );

    expect(screen.queryByLabelText("Frequency")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("End Date")).not.toBeInTheDocument();
  });

  it("shows recurrence fields when Recurring is checked", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(
      screen.getByRole("button", { name: "Add Transaction" })
    );
    await user.click(screen.getByRole("checkbox", { name: "Recurring" }));

    expect(screen.getByLabelText("Frequency")).toBeInTheDocument();
    expect(screen.getByLabelText("End Date")).toBeInTheDocument();
  });

  it("adds a one-off transaction on submit", async () => {
    const user = userEvent.setup();
    renderDialog();

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
    renderDialog();

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
    renderDialog();

    await user.click(
      screen.getByRole("button", { name: "Add Transaction" })
    );
    await user.type(screen.getByLabelText("Description"), "Nothing");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(screen.getByTestId("transactions")).toBeEmptyDOMElement();
  });

  it("closes dialog after submit", async () => {
    const user = userEvent.setup();
    renderDialog();

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
    renderDialog();

    await user.click(
      screen.getByRole("button", { name: "Add Transaction" })
    );
    await user.clear(screen.getByLabelText("Amount"));
    await user.type(screen.getByLabelText("Amount"), "1200");
    await user.type(screen.getByLabelText("Description"), "Insurance");
    await user.click(screen.getByRole("checkbox", { name: "Recurring" }));

    // Change frequency to Yearly
    await user.click(screen.getByRole("combobox", { name: "Frequency" }));
    await user.click(screen.getByRole("option", { name: "Yearly" }));

    // Set end date
    await user.type(screen.getByLabelText("End Date"), "2030-01-01");

    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(
      screen.getByText("Insurance - 1200 - Yearly")
    ).toBeInTheDocument();
  });

  it("resets form after submit", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(
      screen.getByRole("button", { name: "Add Transaction" })
    );
    await user.clear(screen.getByLabelText("Amount"));
    await user.type(screen.getByLabelText("Amount"), "250");
    await user.type(screen.getByLabelText("Description"), "Groceries");
    await user.click(screen.getByRole("checkbox", { name: "Recurring" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));

    // Reopen dialog
    await user.click(
      screen.getByRole("button", { name: "Add Transaction" })
    );

    expect(screen.getByLabelText("Amount")).toHaveValue(0);
    expect(screen.getByLabelText("Description")).toHaveValue("");
    expect(
      screen.getByRole("checkbox", { name: "Recurring" })
    ).not.toBeChecked();
    expect(screen.queryByLabelText("Frequency")).not.toBeInTheDocument();
  });

  it("trims whitespace from description", async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(
      screen.getByRole("button", { name: "Add Transaction" })
    );
    await user.clear(screen.getByLabelText("Amount"));
    await user.type(screen.getByLabelText("Amount"), "100");
    await user.type(screen.getByLabelText("Description"), "  Padded  ");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(screen.getByText("Padded - 100")).toBeInTheDocument();
  });
});

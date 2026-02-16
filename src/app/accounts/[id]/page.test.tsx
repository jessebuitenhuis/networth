import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Account } from "@/accounts/Account.type";
import { AccountType } from "@/accounts/AccountType";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccountProvider } from "@/accounts/AccountContext";
import { RecurringTransactionProvider } from "@/context/RecurringTransactionContext";
import { ScenarioProvider } from "@/scenarios/ScenarioContext";
import { TransactionProvider } from "@/context/TransactionContext";
import type { Scenario } from "@/scenarios/Scenario.type";
import { mockResizeObserver } from "@/test/mocks/mockResizeObserver";
import { suppressActWarnings } from "@/test/mocks/suppressActWarnings";
import { suppressRechartsWarnings } from "@/test/mocks/suppressRechartsWarnings";
import type { Transaction } from "@/transactions/Transaction.type";

import AccountDetailPage from "./page";

mockResizeObserver();
suppressRechartsWarnings();
suppressActWarnings();

const accounts: Account[] = [
  { id: "a1", name: "Checking", type: AccountType.Asset },
];

const transactions: Transaction[] = [
  { id: "t1", accountId: "a1", amount: 1000, date: "2024-01-01", description: "Opening balance" },
  { id: "t2", accountId: "a1", amount: -200, date: "2024-01-02", description: "Groceries" },
];

function renderPage(
  id: string,
  activeScenarioId?: string | null,
  scenarios: Scenario[] = []
) {
  if (scenarios.length > 0) {
    localStorage.setItem("scenarios", JSON.stringify(scenarios));
  }
  if (activeScenarioId !== undefined) {
    if (activeScenarioId === null) {
      localStorage.removeItem("activeScenarioId");
    } else {
      localStorage.setItem("activeScenarioId", activeScenarioId);
    }
  }
  return render(
    <TooltipProvider>
      <SidebarProvider>
        <AccountProvider>
          <TransactionProvider>
            <ScenarioProvider>
              <RecurringTransactionProvider>
                <AccountDetailPage params={{ id }} />
              </RecurringTransactionProvider>
            </ScenarioProvider>
          </TransactionProvider>
        </AccountProvider>
      </SidebarProvider>
    </TooltipProvider>
  );
}

describe("AccountDetailPage", () => {
  beforeEach(() => {
    localStorage.clear();
    // AGENT: should this be a re-usable util function?
    vi.stubGlobal("crypto", { randomUUID: () => "test-uuid" });
  });

  it("shows account name as heading", async () => {
    localStorage.setItem("accounts", JSON.stringify(accounts));
    localStorage.setItem("transactions", JSON.stringify(transactions));
    renderPage("a1");

    expect(await screen.findByRole("heading", { name: "Checking" })).toBeInTheDocument();
  });

  it("shows current balance computed from transactions", async () => {
    localStorage.setItem("accounts", JSON.stringify(accounts));
    localStorage.setItem("transactions", JSON.stringify(transactions));
    renderPage("a1");

    expect(await screen.findByText("US$800.00")).toBeInTheDocument();
  });

  it("renders transaction list", async () => {
    localStorage.setItem("accounts", JSON.stringify(accounts));
    localStorage.setItem("transactions", JSON.stringify(transactions));
    renderPage("a1");

    expect(await screen.findByText("Opening balance")).toBeInTheDocument();
    expect(screen.getByText("Groceries")).toBeInTheDocument();
  });

  it("renders add transaction dialog trigger", async () => {
    localStorage.setItem("accounts", JSON.stringify(accounts));
    localStorage.setItem("transactions", JSON.stringify([]));
    renderPage("a1");

    expect(await screen.findByRole("button", { name: "Add Transaction" })).toBeInTheDocument();
  });

  it("shows 'Account not found' for invalid ID", () => {
    renderPage("nonexistent");

    expect(screen.getByText("Account not found")).toBeInTheDocument();
  });

  it("shows scenario filter in TopBar with 'Baseline only' default", () => {
    // AGENT: description does not exist in type Scenario. I see an error in my IDE, why do you not see this? Fix this, but also the root cause so this error is clear (run tsc?)
    const scenarios: Scenario[] = [
      { id: "s1", name: "Scenario 1", description: "" },
    ];
    localStorage.setItem("accounts", JSON.stringify(accounts));
    localStorage.setItem("transactions", JSON.stringify(transactions));
    renderPage("a1", null, scenarios);

    const filter = screen.getByRole("combobox", { name: "Scenario filter" });
    expect(filter).toHaveTextContent("Baseline only");
  });

  it("filters balance by selected scenario", async () => {
    const user = userEvent.setup();
    const scenarios: Scenario[] = [
      { id: "s1", name: "Scenario 1", description: "" },
    ];
    const scenarioTransactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: 1000, date: "2024-01-01", description: "Baseline" },
      { id: "t2", accountId: "a1", amount: 500, date: "2024-01-02", description: "Scenario tx", scenarioId: "s1" },
    ];
    localStorage.setItem("accounts", JSON.stringify(accounts));
    localStorage.setItem("transactions", JSON.stringify(scenarioTransactions));
    renderPage("a1", null, scenarios);

    expect(await screen.findByText("US$1,000.00")).toBeInTheDocument();

    const filter = screen.getByRole("combobox", { name: "Scenario filter" });
    await user.click(filter);

    const scenario1Option = screen.getByRole("option", { name: "Scenario 1" });
    await user.click(scenario1Option);

    expect(await screen.findByText("US$1,500.00")).toBeInTheDocument();
  });

  it("handles deleted scenario gracefully (falls back to baseline)", async () => {
    const scenarios: Scenario[] = [
      { id: "s1", name: "Scenario 1", description: "" },
    ];
    const scenarioTransactions: Transaction[] = [
      { id: "t1", accountId: "a1", amount: 1000, date: "2024-01-01", description: "Baseline" },
      { id: "t2", accountId: "a1", amount: 500, date: "2024-01-02", description: "Deleted scenario tx", scenarioId: "deleted" },
    ];
    localStorage.setItem("accounts", JSON.stringify(accounts));
    localStorage.setItem("transactions", JSON.stringify(scenarioTransactions));
    renderPage("a1", "deleted", scenarios);

    const filter = screen.getByRole("combobox", { name: "Scenario filter" });
    expect(filter).toHaveTextContent("Baseline only");

    expect(await screen.findByText("US$1,000.00")).toBeInTheDocument();
  });
});

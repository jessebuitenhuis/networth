import { render, screen } from "@testing-library/react";
import { beforeEach,describe, expect, it } from "vitest";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AccountProvider } from "@/context/AccountContext";
import { RecurringTransactionProvider } from "@/context/RecurringTransactionContext";
import { ScenarioProvider } from "@/context/ScenarioContext";
import { TransactionProvider } from "@/context/TransactionContext";
import { mockResizeObserver } from "@/test/mocks/mockResizeObserver";
import { suppressRechartsWarnings } from "@/test/mocks/suppressRechartsWarnings";

import Home from "./page";

mockResizeObserver();
suppressRechartsWarnings();

function renderPage() {
  return render(
    <SidebarProvider>
      <AccountProvider>
        <TransactionProvider>
          <ScenarioProvider>
            <RecurringTransactionProvider>
              <Home />
            </RecurringTransactionProvider>
          </ScenarioProvider>
        </TransactionProvider>
      </AccountProvider>
    </SidebarProvider>
  );
}

describe("Dashboard", () => {
  beforeEach(() => localStorage.clear());

  it("renders the page heading", () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Dashboard"
    );
  });

  it("renders net worth summary", () => {
    renderPage();
    expect(screen.getByText("Net Worth")).toBeInTheDocument();
  });

  it("renders the net worth chart", () => {
    renderPage();
    expect(screen.getByTestId("net-worth-chart")).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AccountProvider } from "@/accounts/AccountContext";
import { RecurringTransactionProvider } from "@/context/RecurringTransactionContext";
import { ScenarioProvider } from "@/context/ScenarioContext";
import { TransactionProvider } from "@/context/TransactionContext";
import { GoalProvider } from "@/goals/GoalContext";
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
              <GoalProvider>
                <Home />
              </GoalProvider>
            </RecurringTransactionProvider>
          </ScenarioProvider>
        </TransactionProvider>
      </AccountProvider>
    </SidebarProvider>
  );
}

describe("Dashboard", () => {
  beforeEach(() => localStorage.clear());

  describe("when no accounts exist", () => {
    it("renders the page heading", () => {
      renderPage();
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Dashboard"
      );
    });

    it("renders the empty state CTA", () => {
      renderPage();
      expect(screen.getByText("Welcome to Net Worth Tracker")).toBeInTheDocument();
      expect(
        screen.getByText(/create your first account to start tracking/i)
      ).toBeInTheDocument();
    });

    it("does not render net worth summary", () => {
      renderPage();
      expect(screen.queryByText("Net Worth")).not.toBeInTheDocument();
    });

    it("does not render net worth chart", () => {
      renderPage();
      expect(screen.queryByTestId("net-worth-chart")).not.toBeInTheDocument();
    });

    it("opens create account dialog when CTA is clicked", async () => {
      const user = userEvent.setup();
      renderPage();
      const button = screen.getByRole("button", { name: "Get Started" });
      await user.click(button);
      expect(screen.getByRole("dialog", { name: "Add Account" })).toBeInTheDocument();
    });
  });

  describe("when accounts exist", () => {
    beforeEach(() => {
      localStorage.setItem(
        "accounts",
        JSON.stringify([{ id: "1", name: "Checking", type: "Asset" }])
      );
    });

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

    it("does not render empty state CTA", () => {
      renderPage();
      expect(screen.queryByText("Welcome to Net Worth Tracker")).not.toBeInTheDocument();
    });

    it("does not render goal section when no goals exist", () => {
      renderPage();
      expect(screen.queryByText("Goal Progress")).not.toBeInTheDocument();
    });

    it("renders goal section when goals exist", () => {
      localStorage.setItem(
        "goals",
        JSON.stringify([{ id: "g1", name: "Retirement", targetAmount: 100000 }])
      );
      renderPage();
      expect(screen.getByText("Goal Progress")).toBeInTheDocument();
      expect(screen.getByText("Retirement")).toBeInTheDocument();
    });
  });
});

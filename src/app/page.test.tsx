import { beforeEach, describe, expect, it } from "vitest";

import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import { mockResizeObserver } from "@/test/mocks/mockResizeObserver";
import { suppressRechartsWarnings } from "@/test/mocks/suppressRechartsWarnings";

import { DashboardPage } from "./page.page";

mockResizeObserver();
suppressRechartsWarnings();

describe("Dashboard", () => {
  beforeEach(() => {
    mockApiResponses();
  });

  describe("when no accounts exist", () => {
    it("renders the page heading", () => {
      const page = DashboardPage.render();
      expect(page.heading).toHaveTextContent("Dashboard");
    });

    it("renders the empty state CTA", () => {
      const page = DashboardPage.render();
      expect(page.getText("Welcome to Net Worth Tracker")).toBeInTheDocument();
      expect(
        page.getText(/create your first account to start tracking/i)
      ).toBeInTheDocument();
    });

    it("does not render net worth summary", () => {
      const page = DashboardPage.render();
      expect(page.queryText("Net Worth")).not.toBeInTheDocument();
    });

    it("does not render net worth chart", () => {
      const page = DashboardPage.render();
      expect(page.queryTestId("net-worth-chart")).not.toBeInTheDocument();
    });

    it("opens create account dialog when CTA is clicked", async () => {
      const page = DashboardPage.render();
      await page.clickButton("Get Started");
      expect(page.getDialog("Add Account")).toBeInTheDocument();
    });
  });

  describe("when accounts exist", () => {
    beforeEach(() => {
      mockApiResponses({
        accounts: [{ id: "1", name: "Checking", type: "Asset" }],
      });
    });

    it("renders the page heading", () => {
      const page = DashboardPage.render();
      expect(page.heading).toHaveTextContent("Dashboard");
    });

    it("renders net worth summary", async () => {
      const page = DashboardPage.render();
      expect(await page.findText("Net Worth")).toBeInTheDocument();
    });

    it("renders the net worth chart", async () => {
      const page = DashboardPage.render();
      expect(await page.findTestId("net-worth-chart")).toBeInTheDocument();
    });

    it("does not render empty state CTA", async () => {
      const page = DashboardPage.render();
      await page.findText("Net Worth");
      expect(page.queryText("Welcome to Net Worth Tracker")).not.toBeInTheDocument();
    });

    it("does not render goal section when no goals exist", async () => {
      const page = DashboardPage.render();
      await page.findText("Net Worth");
      expect(page.queryText("Goal Progress")).not.toBeInTheDocument();
    });

    it("renders goal section when goals exist", async () => {
      mockApiResponses({
        accounts: [{ id: "1", name: "Checking", type: "Asset" }],
        goals: [{ id: "g1", name: "Retirement", targetAmount: 100000 }],
      });
      const page = DashboardPage.render();
      expect(await page.findText("Goal Progress")).toBeInTheDocument();
      expect(page.getText("Retirement")).toBeInTheDocument();
    });
  });
});

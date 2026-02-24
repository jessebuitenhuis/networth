import { beforeEach, describe, expect, it, vi } from "vitest";

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

import { mockApiResponses } from "@/test/mocks/mockApiResponses";
import { mockResizeObserver } from "@/test/mocks/mockResizeObserver";
import { suppressRechartsWarnings } from "@/test/mocks/suppressRechartsWarnings";

import { DashboardPage } from "./page.page";

mockResizeObserver();
suppressRechartsWarnings();

describe("Dashboard", () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  describe("when no accounts and setup not completed", () => {
    beforeEach(() => {
      mockApiResponses({ setupCompleted: false });
    });

    it("redirects to /setup", async () => {
      DashboardPage.render();
      await vi.waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith("/setup");
      });
    });
  });

  describe("when no accounts but setup completed", () => {
    beforeEach(() => {
      mockApiResponses({ setupCompleted: true });
    });

    it("renders the page heading", async () => {
      const page = DashboardPage.render();
      expect(await page.findHeading()).toHaveTextContent("Dashboard");
    });
  });

  describe("when accounts exist", () => {
    beforeEach(() => {
      mockApiResponses({
        accounts: [{ id: "1", name: "Checking", type: "Asset" }],
      });
    });

    it("renders the page heading", async () => {
      const page = DashboardPage.render();
      expect(await page.findHeading()).toHaveTextContent("Dashboard");
    });

    it("renders net worth summary", async () => {
      const page = DashboardPage.render();
      expect(await page.findText("Net Worth")).toBeInTheDocument();
    });

    it("renders the net worth chart", async () => {
      const page = DashboardPage.render();
      expect(await page.findTestId("net-worth-chart")).toBeInTheDocument();
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

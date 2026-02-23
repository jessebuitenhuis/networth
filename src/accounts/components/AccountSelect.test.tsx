import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { mockResizeObserver } from "@/test/mocks/mockResizeObserver";

mockResizeObserver();

import { AccountSelectPage } from "./AccountSelect.page";

describe("AccountSelect", () => {
  it("renders with label", () => {
    const page = AccountSelectPage.render();
    expect(page.label).toBeInTheDocument();
  });

  it("shows placeholder when no account selected", () => {
    const page = AccountSelectPage.render();
    expect(page.trigger).toHaveTextContent("Select account");
  });

  it("lists all accounts", async () => {
    const page = AccountSelectPage.render();
    await page.open();

    expect(screen.getByRole("option", { name: "Checking" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Savings" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Mortgage" })).toBeInTheDocument();
  });

  it("calls onValueChange when account is selected", async () => {
    const page = AccountSelectPage.render();
    await page.select("Savings");

    expect(page.onValueChange).toHaveBeenCalledWith("a2");
  });

  it("shows selected account name", () => {
    AccountSelectPage.render({ value: "a1" });
    expect(screen.getByText("Checking")).toBeInTheDocument();
  });

  it("does not have a 'None' option", async () => {
    const page = AccountSelectPage.render();
    await page.open();

    expect(page.queryOption(/none/i)).not.toBeInTheDocument();
  });
});

import { describe, expect, it } from "vitest";

import { AccountType } from "@/accounts/AccountType";

import { AccountIconPage } from "./AccountIcon.page";

describe("AccountIcon", () => {
  it("renders first two letters of name, uppercased", () => {
    const page = AccountIconPage.render("savings", AccountType.Asset);
    expect(page.getByText("SA")).toBeInTheDocument();
  });

  it("handles single letter names", () => {
    const page = AccountIconPage.render("x", AccountType.Asset);
    expect(page.getByText("X")).toBeInTheDocument();
  });

  it("applies dark background with white text", () => {
    const page = AccountIconPage.render("test", AccountType.Asset);
    const icon = page.getByText("TE");

    expect(icon).toHaveClass("bg-zinc-800");
    expect(icon).toHaveClass("text-white");
    expect(icon).toHaveClass("dark:bg-zinc-700");
  });

  it("has rounded styling with correct size and shrink-0", () => {
    const page = AccountIconPage.render("test", AccountType.Asset);
    const icon = page.getByText("TE");

    expect(icon).toHaveClass("size-4");
    expect(icon).toHaveClass("shrink-0");
    expect(icon).toHaveClass("rounded");
  });
});

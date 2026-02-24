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

  it("applies asset icon class for asset type", () => {
    const page = AccountIconPage.render("test", AccountType.Asset);
    const icon = page.getByText("TE");

    expect(icon).toHaveClass("account-icon-asset");
  });

  it("applies liability icon class for liability type", () => {
    const page = AccountIconPage.render("test", AccountType.Liability);
    const icon = page.getByText("TE");

    expect(icon).toHaveClass("account-icon-liability");
  });

  it("has rounded styling with correct size and shrink-0", () => {
    const page = AccountIconPage.render("test", AccountType.Asset);
    const icon = page.getByText("TE");

    expect(icon).toHaveClass("size-7");
    expect(icon).toHaveClass("shrink-0");
    expect(icon).toHaveClass("rounded-md");
  });
});

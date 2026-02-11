import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AccountListItem } from "./AccountListItem";

describe("AccountListItem", () => {
  it("displays the account name", () => {
    render(<AccountListItem name="Checking" type="Asset" balance={1000} />);
    expect(screen.getByText("Checking")).toBeInTheDocument();
  });

  it("displays the account type", () => {
    render(<AccountListItem name="Checking" type="Asset" balance={1000} />);
    expect(screen.getByText("Asset")).toBeInTheDocument();
  });

  it("displays formatted balance", () => {
    render(<AccountListItem name="Checking" type="Asset" balance={1500} />);
    expect(screen.getByText("$1,500.00")).toBeInTheDocument();
  });
});

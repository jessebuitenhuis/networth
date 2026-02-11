import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AccountListItem } from "./AccountListItem";

describe("AccountListItem", () => {
  it("displays the account name", () => {
    render(
      <AccountListItem
        name="Checking"
        type="Asset"
        balance={1000}
        onRemove={() => {}}
      />
    );
    expect(screen.getByText("Checking")).toBeInTheDocument();
  });

  it("displays the account type", () => {
    render(
      <AccountListItem
        name="Checking"
        type="Asset"
        balance={1000}
        onRemove={() => {}}
      />
    );
    expect(screen.getByText("Asset")).toBeInTheDocument();
  });

  it("displays formatted balance", () => {
    render(
      <AccountListItem
        name="Checking"
        type="Asset"
        balance={1500}
        onRemove={() => {}}
      />
    );
    expect(screen.getByText("$1,500.00")).toBeInTheDocument();
  });

  it("calls onRemove when remove button is clicked", async () => {
    const onRemove = vi.fn();
    const user = userEvent.setup();
    render(
      <AccountListItem
        name="Checking"
        type="Asset"
        balance={1000}
        onRemove={onRemove}
      />
    );

    await user.click(screen.getByRole("button", { name: "Remove" }));
    expect(onRemove).toHaveBeenCalledOnce();
  });
});

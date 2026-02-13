import { render, screen } from "@testing-library/react";
import { describe, expect,it } from "vitest";

import { AccountType } from "@/models/AccountType";

import { AccountIcon } from "./AccountIcon";

describe("AccountIcon", () => {
  it("renders first two letters of name, uppercased", () => {
    render(<AccountIcon name="savings" type={AccountType.Asset} />);
    expect(screen.getByText("SA")).toBeInTheDocument();
  });

  it("handles single letter names", () => {
    render(<AccountIcon name="x" type={AccountType.Asset} />);
    expect(screen.getByText("X")).toBeInTheDocument();
  });

  it("applies dark background with white text", () => {
    render(<AccountIcon name="test" type={AccountType.Asset} />);
    const icon = screen.getByText("TE");

    expect(icon).toHaveClass("bg-zinc-800");
    expect(icon).toHaveClass("text-white");
    expect(icon).toHaveClass("dark:bg-zinc-700");
  });

  it("has rounded styling with correct size and shrink-0", () => {
    render(<AccountIcon name="test" type={AccountType.Asset} />);
    const icon = screen.getByText("TE");

    expect(icon).toHaveClass("size-4");
    expect(icon).toHaveClass("shrink-0");
    expect(icon).toHaveClass("rounded");
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input } from "./input";

describe("Input", () => {
  it("renders with autocomplete off by default", () => {
    render(<Input data-testid="test-input" />);

    const input = screen.getByTestId("test-input");
    expect(input).toHaveAttribute("autocomplete", "off");
  });

  it("allows overriding autoComplete via props", () => {
    render(<Input data-testid="test-input" autoComplete="username" />);

    const input = screen.getByTestId("test-input");
    expect(input).toHaveAttribute("autocomplete", "username");
  });

  it("renders with correct type when provided", () => {
    render(<Input data-testid="test-input" type="email" />);

    const input = screen.getByTestId("test-input");
    expect(input).toHaveAttribute("type", "email");
  });

  it("passes through other props correctly", () => {
    render(<Input data-testid="test-input" placeholder="Enter text" />);

    const input = screen.getByTestId("test-input");
    expect(input).toHaveAttribute("placeholder", "Enter text");
  });

  it("includes data-1p-ignore to prevent password manager suggestions", () => {
    render(<Input data-testid="test-input" />);

    const input = screen.getByTestId("test-input");
    expect(input).toHaveAttribute("data-1p-ignore");
  });
});

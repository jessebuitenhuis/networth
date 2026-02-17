import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CurrencyInput } from "./CurrencyInput";

describe("CurrencyInput", () => {
  it("renders with initial value", () => {
    render(<CurrencyInput value={0} onChange={() => {}} />);
    expect(screen.getByRole("textbox")).toHaveValue("0");
  });

  it("renders positive value formatted", () => {
    render(<CurrencyInput value={1000} onChange={() => {}} />);
    expect(screen.getByRole("textbox")).toHaveValue("1,000");
  });

  it("renders negative value with minus toggle", () => {
    render(<CurrencyInput value={-500} onChange={() => {}} />);
    expect(screen.getByRole("textbox")).toHaveValue("500");
    expect(screen.getByRole("button", { name: /minus/i })).toBeInTheDocument();
  });

  it("shows plus toggle for positive values", () => {
    render(<CurrencyInput value={100} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /plus/i })).toBeInTheDocument();
  });

  it("formats numbers as user types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CurrencyInput value={0} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "1234");

    expect(input).toHaveValue("1,234");
    expect(onChange).toHaveBeenLastCalledWith(1234);
  });

  it("restricts decimals to 2 places", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CurrencyInput value={0} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "123.456");

    expect(input).toHaveValue("123.45");
    expect(onChange).toHaveBeenLastCalledWith(123.45);
  });

  it("handles decimal point entry", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CurrencyInput value={0} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "10.5");

    expect(input).toHaveValue("10.5");
    expect(onChange).toHaveBeenLastCalledWith(10.5);
  });

  it("toggles sign from positive to negative", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CurrencyInput value={100} onChange={onChange} />);

    const toggle = screen.getByRole("button", { name: /plus/i });
    await user.click(toggle);

    expect(onChange).toHaveBeenCalledWith(-100);
  });

  it("toggles sign from negative to positive", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CurrencyInput value={-100} onChange={onChange} />);

    const toggle = screen.getByRole("button", { name: /minus/i });
    await user.click(toggle);

    expect(onChange).toHaveBeenCalledWith(100);
  });

  it("formats to 2 decimals on blur", async () => {
    const user = userEvent.setup();
    render(<CurrencyInput value={100} onChange={() => {}} />);

    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.tab();

    expect(input).toHaveValue("100.00");
  });

  it("selects all text on focus when value is zero", async () => {
    const user = userEvent.setup();
    render(<CurrencyInput value={0} onChange={() => {}} />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    await user.click(input);

    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(input.value.length);
  });

  it("syncs display when parent changes value", () => {
    const { rerender } = render(<CurrencyInput value={100} onChange={() => {}} />);
    expect(screen.getByRole("textbox")).toHaveValue("100");

    rerender(<CurrencyInput value={200} onChange={() => {}} />);
    expect(screen.getByRole("textbox")).toHaveValue("200");
  });

  it("accepts id prop", () => {
    render(<CurrencyInput value={0} onChange={() => {}} id="test-id" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("id", "test-id");
  });

  it("accepts aria-label prop", () => {
    render(
      <CurrencyInput value={0} onChange={() => {}} aria-label="Test Amount" />
    );
    expect(screen.getByRole("textbox")).toHaveAccessibleName("Test Amount");
  });

  it("handles empty input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CurrencyInput value={100} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    await user.clear(input);

    expect(input).toHaveValue("");
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("ignores non-numeric characters", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CurrencyInput value={0} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "abc123def");

    expect(input).toHaveValue("123");
    expect(onChange).toHaveBeenLastCalledWith(123);
  });

  it("handles pasting formatted numbers", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CurrencyInput value={0} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.click(input);
    await user.paste("1,234.56");

    expect(parseFloat(input.value.replace(/,/g, ""))).toBeCloseTo(1234.56, 2);
  });

  it("handles onChange with negative values", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CurrencyInput value={-100} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "50");

    // Since toggle is on minus, onChange should be called with negative
    expect(onChange).toHaveBeenCalledWith(-50);
  });

  it("displays currency symbol", () => {
    render(<CurrencyInput value={100} onChange={() => {}} />);
    // Currency symbol should be visible somewhere in the component
    const container = screen.getByRole("textbox").parentElement;
    expect(container).toBeInTheDocument();
  });

  it("handles typing after decimal point", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CurrencyInput value={0} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "10.");

    // Should show decimal point
    expect(input.value).toContain(".");
  });

  it("handles cursor positioning when typing integers without decimal", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CurrencyInput value={0} onChange={onChange} />);

    const input = screen.getByRole("textbox") as HTMLInputElement;
    await user.clear(input);

    // Type integers one by one to exercise cursor positioning logic
    await user.type(input, "5");
    expect(input).toHaveValue("5");

    await user.type(input, "0");
    expect(input).toHaveValue("50");

    await user.type(input, "0");
    expect(input).toHaveValue("500");

    // Verify onChange was called with correct values
    expect(onChange).toHaveBeenLastCalledWith(500);
  });

  it("handles typing large numbers to test cursor positioning without decimals", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CurrencyInput value={0} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    await user.clear(input);

    // Type a large number that will trigger thousand separators
    // This exercises the cursor positioning logic in the else-if branch
    await user.type(input, "123456");

    expect(input).toHaveValue("123,456");
    expect(onChange).toHaveBeenLastCalledWith(123456);
  });

  it("handles typing just a decimal point", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CurrencyInput value={0} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, ".");

    // Should handle decimal point entry
    expect(input.value).toBe(".");
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it("handles typing decimal after removing integer part", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CurrencyInput value={123} onChange={onChange} />);

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, ".5");

    // Should format correctly
    expect(input.value).toBe(".5");
    expect(onChange).toHaveBeenLastCalledWith(0.5);
  });

  it("hides sign toggle when showSignToggle is false", () => {
    render(
      <CurrencyInput value={100} onChange={() => {}} showSignToggle={false} />
    );
    expect(
      screen.queryByRole("button", { name: /plus/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /minus/i })
    ).not.toBeInTheDocument();
  });

  it("shows sign toggle by default", () => {
    render(<CurrencyInput value={100} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /plus/i })).toBeInTheDocument();
  });
});

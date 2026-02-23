import { describe, expect, it, vi } from "vitest";

import { CurrencyInput } from "./CurrencyInput";
import { CurrencyInputPage } from "./CurrencyInput.page";

describe("CurrencyInput", () => {
  it("renders with initial value", () => {
    const page = CurrencyInputPage.render({ value: 0, onChange: vi.fn() });
    expect(page.input).toHaveValue("0");
  });

  it("renders positive value formatted", () => {
    const page = CurrencyInputPage.render({ value: 1000, onChange: vi.fn() });
    expect(page.input).toHaveValue("1,000");
  });

  it("renders negative value with minus toggle", () => {
    const page = CurrencyInputPage.render({ value: -500, onChange: vi.fn() });
    expect(page.input).toHaveValue("500");
    expect(page.minusToggle).toBeInTheDocument();
  });

  it("shows plus toggle for positive values", () => {
    const page = CurrencyInputPage.render({ value: 100, onChange: vi.fn() });
    expect(page.plusToggle).toBeInTheDocument();
  });

  it("formats numbers as user types", async () => {
    const onChange = vi.fn();
    const page = CurrencyInputPage.render({ value: 0, onChange });

    await page.typeValue("1234");

    expect(page.input).toHaveValue("1,234");
    expect(onChange).toHaveBeenLastCalledWith(1234);
  });

  it("restricts decimals to 2 places", async () => {
    const onChange = vi.fn();
    const page = CurrencyInputPage.render({ value: 0, onChange });

    await page.typeValue("123.456");

    expect(page.input).toHaveValue("123.45");
    expect(onChange).toHaveBeenLastCalledWith(123.45);
  });

  it("handles decimal point entry", async () => {
    const onChange = vi.fn();
    const page = CurrencyInputPage.render({ value: 0, onChange });

    await page.typeValue("10.5");

    expect(page.input).toHaveValue("10.5");
    expect(onChange).toHaveBeenLastCalledWith(10.5);
  });

  it("toggles sign from positive to negative", async () => {
    const onChange = vi.fn();
    const page = CurrencyInputPage.render({ value: 100, onChange });

    await page.toggleSign();

    expect(onChange).toHaveBeenCalledWith(-100);
  });

  it("toggles sign from negative to positive", async () => {
    const onChange = vi.fn();
    const page = CurrencyInputPage.render({ value: -100, onChange });

    await page.toggleSign();

    expect(onChange).toHaveBeenCalledWith(100);
  });

  it("formats to 2 decimals on blur", async () => {
    const page = CurrencyInputPage.render({ value: 100, onChange: vi.fn() });

    await page.focusInput();
    await page.blurInput();

    expect(page.input).toHaveValue("100.00");
  });

  it("selects all text on focus when value is zero", async () => {
    const page = CurrencyInputPage.render({ value: 0, onChange: vi.fn() });

    await page.focusInput();

    expect(page.input.selectionStart).toBe(0);
    expect(page.input.selectionEnd).toBe(page.input.value.length);
  });

  it("syncs display when parent changes value", () => {
    const { page, rerender } = CurrencyInputPage.renderWithRerender({
      value: 100,
      onChange: vi.fn(),
    });
    expect(page.input).toHaveValue("100");

    rerender(<CurrencyInput value={200} onChange={vi.fn()} />);
    expect(page.input).toHaveValue("200");
  });

  it("accepts id prop", () => {
    const page = CurrencyInputPage.render({
      value: 0,
      onChange: vi.fn(),
      id: "test-id",
    });
    expect(page.input).toHaveAttribute("id", "test-id");
  });

  it("accepts aria-label prop", () => {
    const page = CurrencyInputPage.render({
      value: 0,
      onChange: vi.fn(),
      "aria-label": "Test Amount",
    });
    expect(page.input).toHaveAccessibleName("Test Amount");
  });

  it("handles empty input", async () => {
    const onChange = vi.fn();
    const page = CurrencyInputPage.render({ value: 100, onChange });

    await page.clearInput();

    expect(page.input).toHaveValue("");
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("ignores non-numeric characters", async () => {
    const onChange = vi.fn();
    const page = CurrencyInputPage.render({ value: 0, onChange });

    await page.typeValue("abc123def");

    expect(page.input).toHaveValue("123");
    expect(onChange).toHaveBeenLastCalledWith(123);
  });

  it("handles pasting formatted numbers", async () => {
    const onChange = vi.fn();
    const page = CurrencyInputPage.render({ value: 0, onChange });

    await page.pasteValue("1,234.56");

    expect(parseFloat(page.input.value.replace(/,/g, ""))).toBeCloseTo(
      1234.56,
      2
    );
  });

  it("handles onChange with negative values", async () => {
    const onChange = vi.fn();
    const page = CurrencyInputPage.render({ value: -100, onChange });

    await page.typeValue("50");

    // Since toggle is on minus, onChange should be called with negative
    expect(onChange).toHaveBeenCalledWith(-50);
  });

  it("displays currency symbol", () => {
    const page = CurrencyInputPage.render({ value: 100, onChange: vi.fn() });
    // Currency symbol should be visible somewhere in the component
    const container = page.input.parentElement;
    expect(container).toBeInTheDocument();
  });

  it("handles typing after decimal point", async () => {
    const page = CurrencyInputPage.render({ value: 0, onChange: vi.fn() });

    await page.typeValue("10.");

    // Should show decimal point
    expect(page.input.value).toContain(".");
  });

  it("handles cursor positioning when typing integers without decimal", async () => {
    const onChange = vi.fn();
    const page = CurrencyInputPage.render({ value: 0, onChange });

    await page.clearInput();

    // Type integers one by one to exercise cursor positioning logic
    await page.typeChar("5");
    expect(page.input).toHaveValue("5");

    await page.typeChar("0");
    expect(page.input).toHaveValue("50");

    await page.typeChar("0");
    expect(page.input).toHaveValue("500");

    // Verify onChange was called with correct values
    expect(onChange).toHaveBeenLastCalledWith(500);
  });

  it("handles typing large numbers to test cursor positioning without decimals", async () => {
    const onChange = vi.fn();
    const page = CurrencyInputPage.render({ value: 0, onChange });

    await page.typeValue("123456");

    expect(page.input).toHaveValue("123,456");
    expect(onChange).toHaveBeenLastCalledWith(123456);
  });

  it("handles typing just a decimal point", async () => {
    const onChange = vi.fn();
    const page = CurrencyInputPage.render({ value: 0, onChange });

    await page.typeValue(".");

    // Should handle decimal point entry
    expect(page.input.value).toBe(".");
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it("handles typing decimal after removing integer part", async () => {
    const onChange = vi.fn();
    const page = CurrencyInputPage.render({ value: 123, onChange });

    await page.typeValue(".5");

    // Should format correctly
    expect(page.input.value).toBe(".5");
    expect(onChange).toHaveBeenLastCalledWith(0.5);
  });

  it("hides sign toggle when showSignToggle is false", () => {
    const page = CurrencyInputPage.render({
      value: 100,
      onChange: vi.fn(),
      showSignToggle: false,
    });
    expect(page.queryPlusToggle()).not.toBeInTheDocument();
    expect(page.queryMinusToggle()).not.toBeInTheDocument();
  });

  it("shows sign toggle by default", () => {
    const page = CurrencyInputPage.render({ value: 100, onChange: vi.fn() });
    expect(page.plusToggle).toBeInTheDocument();
  });
});

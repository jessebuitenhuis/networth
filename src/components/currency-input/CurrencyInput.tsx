"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatLocaleNumber,
  parseLocaleNumber,
  getDecimalSeparator,
} from "@/lib/localeNumber";
import { getCurrencySymbol } from "@/lib/getLocale";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  id?: string;
  "aria-label"?: string;
}

export function CurrencyInput({
  value,
  onChange,
  id,
  "aria-label": ariaLabel,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState(() =>
    formatLocaleNumber(Math.abs(value))
  );
  const [isPositive, setIsPositive] = useState(() => value >= 0);
  const cursorPositionRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInternalChangeRef = useRef(false);

  useLayoutEffect(() => {
    if (cursorPositionRef.current !== null && inputRef.current) {
      inputRef.current.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
      cursorPositionRef.current = null;
    }
  }, [displayValue]);

  useEffect(() => {
    const wasInternalChange = isInternalChangeRef.current;
    isInternalChangeRef.current = false;

    if (!wasInternalChange) {
      // Sync external value prop changes to internal display state.
      // This is a controlled component pattern where we maintain formatted display
      // state separately from the numeric value prop. We skip updates when the
      // change originated from user input to avoid overwriting during typing.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayValue(formatLocaleNumber(Math.abs(value)));
      setIsPositive(value >= 0);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const cursorPos = e.target.selectionStart;
    const decimalSep = getDecimalSeparator();

    const digitPattern = new RegExp(
      `[^0-9${decimalSep.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}]`,
      "g"
    );
    let cleaned = input.replace(digitPattern, "");

    const decimalIndex = cleaned.indexOf(decimalSep);
    if (decimalIndex !== -1) {
      const integerPart = cleaned.slice(0, decimalIndex);
      let decimalPart = cleaned.slice(decimalIndex + 1).replace(
        new RegExp(decimalSep.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
        ""
      );
      decimalPart = decimalPart.slice(0, 2);
      cleaned = integerPart + decimalSep + decimalPart;
    }

    const numValue = parseLocaleNumber(cleaned);

    const parts = cleaned.split(decimalSep);
    const integerPart = parts[0] || "";
    const decimalPart = parts[1];

    const formattedInteger = integerPart
      ? formatLocaleNumber(parseFloat(integerPart) || 0)
      : "";
    const formatted =
      decimalPart !== undefined
        ? formattedInteger + decimalSep + decimalPart
        : formattedInteger || cleaned;

    const beforeCursor = input.slice(0, cursorPos || 0);
    const decimalPosInInput = beforeCursor.indexOf(decimalSep);
    const decimalPosInFormatted = formatted.indexOf(decimalSep);

    let newCursorPos = formatted.length;
    if (decimalPosInInput !== -1 && decimalPosInFormatted !== -1) {
      const digitsAfterDecimalBeforeCursor = beforeCursor
        .slice(decimalPosInInput + 1)
        .replace(/[^0-9]/g, "").length;
      newCursorPos = decimalPosInFormatted + 1 + digitsAfterDecimalBeforeCursor;
    } else if (decimalPosInFormatted === -1) {
      const digitsBeforeCursor = beforeCursor.replace(/[^0-9]/g, "").length;
      let digitCount = 0;
      for (let i = 0; i < formatted.length; i++) {
        if (/[0-9]/.test(formatted[i])) {
          digitCount++;
        }
        if (digitCount >= digitsBeforeCursor) {
          newCursorPos = i + 1;
          break;
        }
      }
    }

    setDisplayValue(formatted);
    cursorPositionRef.current = newCursorPos;

    isInternalChangeRef.current = true;
    onChange(isPositive ? numValue : -numValue);
  };

  const handleBlur = () => {
    const numValue = parseLocaleNumber(displayValue);
    setDisplayValue(formatLocaleNumber(numValue, 2));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (parseLocaleNumber(displayValue) === 0) {
      e.target.select();
    }
  };

  const handleToggleSign = () => {
    const numValue = parseLocaleNumber(displayValue);
    setIsPositive(!isPositive);
    isInternalChangeRef.current = true;
    onChange(isPositive ? -numValue : numValue);
  };

  const currencySymbol = getCurrencySymbol();

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleToggleSign}
        aria-label={isPositive ? "Plus" : "Minus"}
        className={isPositive ? "text-green-600 hover:text-green-700" : "text-red-600 hover:text-red-700"}
      >
        {isPositive ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
      </Button>
      <div className="relative flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          {currencySymbol}
        </span>
        <Input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          id={id}
          aria-label={ariaLabel}
          className="pl-8"
        />
      </div>
    </div>
  );
}

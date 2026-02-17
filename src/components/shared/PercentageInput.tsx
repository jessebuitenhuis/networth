"use client";

import { Input } from "@/components/ui/input";

interface PercentageInputProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  "aria-label"?: string;
  placeholder?: string;
}

export function PercentageInput({
  value,
  onChange,
  id,
  "aria-label": ariaLabel,
  placeholder,
}: PercentageInputProps) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        %
      </span>
      <Input
        type="number"
        step="0.1"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        id={id}
        aria-label={ariaLabel}
        autoComplete="off"
        className="pl-8"
      />
    </div>
  );
}

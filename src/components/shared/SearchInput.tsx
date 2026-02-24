"use client";

import { Search } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchInput({ value, onChange, placeholder = "Search..." }: SearchInputProps) {
  const [isOpen, setIsOpen] = useState(value !== "");
  const ref = useRef<HTMLInputElement>(null);

  const open = () => {
    setIsOpen(true);
    setTimeout(() => ref.current?.focus(), 0);
  };

  const handleBlur = () => {
    if (value === "") setIsOpen(false);
  };

  const label = placeholder.replace(/\.+$/, "");

  if (!isOpen) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={open} aria-label="Open search">
        <Search className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        ref={ref}
        type="text"
        placeholder={placeholder}
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={handleBlur}
        className="pl-9 h-8 w-48"
      />
    </div>
  );
}

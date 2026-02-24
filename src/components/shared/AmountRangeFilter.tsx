"use client";

import { DollarSign, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type AmountRangeFilterProps = {
  amountMin: string;
  amountMax: string;
  onAmountMinChange: (value: string) => void;
  onAmountMaxChange: (value: string) => void;
  onClear: () => void;
};

export function AmountRangeFilter({
  amountMin,
  amountMax,
  onAmountMinChange,
  onAmountMaxChange,
  onClear,
}: AmountRangeFilterProps) {
  const isActive = amountMin !== "" || amountMax !== "";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(isActive && "border-primary text-primary")}
          aria-label="Amount range filter"
        >
          <DollarSign className="h-4 w-4 mr-1" />
          Amount
          {isActive && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-primary" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="amount-min" className="text-xs">
              Min
            </Label>
            <Input
              id="amount-min"
              aria-label="Min amount"
              type="number"
              step="any"
              placeholder="Min"
              value={amountMin}
              onChange={(e) => onAmountMinChange(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="amount-max" className="text-xs">
              Max
            </Label>
            <Input
              id="amount-max"
              aria-label="Max amount"
              type="number"
              step="any"
              placeholder="Max"
              value={amountMax}
              onChange={(e) => onAmountMaxChange(e.target.value)}
            />
          </div>
          {isActive && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={onClear}
              aria-label="Clear amount filter"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

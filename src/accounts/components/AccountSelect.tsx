"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import type { Account } from "../Account.type";

type AccountSelectProps = {
  accounts: Account[];
  value: string;
  onValueChange: (value: string) => void;
  hasError?: boolean;
};

export function AccountSelect({
  accounts,
  value,
  onValueChange,
  hasError,
}: AccountSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="account-select">Account</Label>
      <Select value={value === "none" ? undefined : value} onValueChange={onValueChange}>
        <SelectTrigger
          id="account-select"
          className={cn(hasError && "border-destructive")}
        >
          <SelectValue placeholder="Select account" />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasError && (
        <p className="text-sm text-destructive">Please select an account</p>
      )}
    </div>
  );
}

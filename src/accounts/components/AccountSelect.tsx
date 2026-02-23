import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Account } from "../Account.type";

type AccountSelectProps = {
  accounts: Account[];
  value: string;
  onValueChange: (value: string) => void;
};

export function AccountSelect({
  accounts,
  value,
  onValueChange,
}: AccountSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="account-select">Account</Label>
      <Select value={value === "none" ? undefined : value} onValueChange={onValueChange}>
        <SelectTrigger id="account-select">
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
    </div>
  );
}

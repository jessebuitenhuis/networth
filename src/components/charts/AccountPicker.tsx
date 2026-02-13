import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Account } from "@/models/Account.type";

type AccountPickerProps = {
  accounts: Account[];
  excludedIds: Set<string>;
  onToggle: (id: string) => void;
};

export function AccountPicker({
  accounts,
  excludedIds,
  onToggle,
}: AccountPickerProps) {
  const includedCount = accounts.length - excludedIds.size;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          Accounts ({includedCount})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-2">
          {accounts.map((account) => {
            const isIncluded = !excludedIds.has(account.id);
            return (
              <div key={account.id} className="flex items-center gap-2">
                <Checkbox
                  id={account.id}
                  checked={isIncluded}
                  onCheckedChange={() => onToggle(account.id)}
                  aria-label={account.name}
                />
                <Label htmlFor={account.id} className="cursor-pointer">
                  {account.name}
                </Label>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

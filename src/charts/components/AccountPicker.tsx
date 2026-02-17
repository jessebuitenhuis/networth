import { useMemo } from "react";

import type { Account } from "@/accounts/Account.type";
import { MultiSelectPicker } from "@/components/shared/MultiSelectPicker";

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
  const items = useMemo(
    () => accounts.map((a) => ({ id: a.id, label: a.name })),
    [accounts]
  );

  const selectedIds = useMemo(() => {
    const included = new Set<string>();
    for (const a of accounts) {
      if (!excludedIds.has(a.id)) included.add(a.id);
    }
    return included;
  }, [accounts, excludedIds]);

  return (
    <MultiSelectPicker
      label="Accounts"
      items={items}
      selectedIds={selectedIds}
      onToggle={onToggle}
    />
  );
}

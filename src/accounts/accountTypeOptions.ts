import type { SelectOption } from "@/lib/SelectOption.type";

import { AccountType } from "./AccountType";

export const ACCOUNT_TYPE_OPTIONS: SelectOption<AccountType>[] = [
  { value: AccountType.Asset, label: "Asset" },
  { value: AccountType.Liability, label: "Liability" },
];

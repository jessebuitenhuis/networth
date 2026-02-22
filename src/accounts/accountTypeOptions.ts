import type { SelectOption } from "@/recurring-transactions/frequencyOptions";

import { AccountType } from "./AccountType";

export const ACCOUNT_TYPE_OPTIONS: SelectOption<AccountType>[] = [
  { value: AccountType.Asset, label: "Asset" },
  { value: AccountType.Liability, label: "Liability" },
];

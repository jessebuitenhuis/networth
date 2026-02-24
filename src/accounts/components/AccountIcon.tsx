import { AccountType } from "@/accounts/AccountType";

interface AccountIconProps {
  name: string;
  type: AccountType;
}

export function AccountIcon({ name, type }: AccountIconProps) {
  const initials = name.slice(0, 2).toUpperCase();
  const iconClass = type === AccountType.Asset ? "account-icon-asset" : "account-icon-liability";

  return (
    <div className={`flex size-7 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold tracking-wide ${iconClass}`}>
      {initials}
    </div>
  );
}

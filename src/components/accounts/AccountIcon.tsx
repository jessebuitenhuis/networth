import { AccountType } from "@/models/AccountType";

interface AccountIconProps {
  name: string;
  type: AccountType;
}

export function AccountIcon({ name }: AccountIconProps) {
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className="size-4 shrink-0 rounded flex items-center justify-center text-[10px] font-medium bg-zinc-800 text-white dark:bg-zinc-700">
      {initials}
    </div>
  );
}

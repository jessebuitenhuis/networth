import { ReactNode } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

type TopBarProps = {
  title?: string;
  actions?: ReactNode;
};

export default function TopBar({ title, actions }: TopBarProps) {
  return (
    <header className="flex h-12 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      {title && <h1 className="text-lg font-semibold">{title}</h1>}
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </header>
  );
}

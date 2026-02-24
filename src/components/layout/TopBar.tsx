import { ReactNode } from "react";

import { SidebarTrigger } from "@/components/ui/sidebar";

type TopBarProps = {
  title?: string;
  actions?: ReactNode;
};

export default function TopBar({ title, actions }: TopBarProps) {
  return (
    <header className="topbar flex h-14 items-center gap-3 px-5">
      <SidebarTrigger />
      {title && (
        <h1 className="text-base font-medium tracking-wide text-sidebar-foreground">
          {title}
        </h1>
      )}
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </header>
  );
}

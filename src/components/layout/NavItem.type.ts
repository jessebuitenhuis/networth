import type { ReactNode } from "react";

export type NavItem = {
  title: string;
  url: string;
  isActive?: boolean;
  icon?: ReactNode;
  action?: ReactNode;
};

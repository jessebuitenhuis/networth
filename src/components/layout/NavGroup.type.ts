import type { ReactNode } from "react";

import type { NavItem } from "./NavItem.type";

export type NavGroup = {
  label: string;
  labelSuffix?: string;
  items: NavItem[];
  action?: ReactNode;
  footerAction?: ReactNode;
};

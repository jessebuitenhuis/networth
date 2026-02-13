import type { ReactNode } from "react";

import type { NavItem } from "./NavItem.type";

export type NavGroup = {
  label: string;
  items: NavItem[];
  action?: ReactNode;
};

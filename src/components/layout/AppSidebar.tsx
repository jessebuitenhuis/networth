"use client";

import { DollarSign } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { formatCompactCurrency } from "@/lib/formatCompactCurrency";

import type { NavGroup } from "./NavGroup.type";

type AppSidebarProps = {
  navGroups: NavGroup[];
  netWorth: number;
};

export function AppSidebar({ navGroups, netWorth }: AppSidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <DollarSign className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Net Worth</span>
                  <span className="truncate text-xs text-muted-foreground" suppressHydrationWarning>
                    {formatCompactCurrency(netWorth)}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>
              {group.label}
              {group.labelSuffix && (
                <span
                  className="ml-auto font-normal text-muted-foreground"
                  suppressHydrationWarning
                >
                  {group.labelSuffix}
                </span>
              )}
            </SidebarGroupLabel>
            {group.action}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem
                    key={item.url}
                    onMouseEnter={() => setHoveredItem(item.url)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={item.isActive}
                      tooltip={item.title}
                      className={`transition-none ${item.isActive ? "font-bold" : ""}`}
                    >
                      <Link href={item.url}>
                        {item.icon}
                        <span>{item.title}</span>
                        {item.subtitle && (
                          <span
                            className="ml-auto text-xs text-muted-foreground"
                            suppressHydrationWarning
                          >
                            {item.subtitle}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                    {hoveredItem === item.url && item.action}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
            {group.footerAction}
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

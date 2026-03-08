"use client";

import { LogOut } from "lucide-react";

import { SidebarMenuButton } from "@/components/ui/sidebar";

import { logout } from "../actions";

export function LogoutButton() {
  return (
    <SidebarMenuButton onClick={() => logout()} tooltip="Sign out">
      <LogOut />
      <span>Sign out</span>
    </SidebarMenuButton>
  );
}

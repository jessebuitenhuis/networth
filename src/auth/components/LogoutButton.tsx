"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { SidebarMenuButton } from "@/components/ui/sidebar";

import { getSupabaseBrowserClient } from "../supabaseBrowserClient";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <SidebarMenuButton onClick={handleLogout} tooltip="Sign out">
      <LogOut />
      <span>Sign out</span>
    </SidebarMenuButton>
  );
}

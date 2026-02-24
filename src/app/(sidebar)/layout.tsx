"use client";

import {
  ArrowLeftRight,
  Landmark,
  Settings,
  Target,
  TrendingUp,
} from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import type { NavGroup } from "@/components/layout/NavGroup.type";

const navGroups: NavGroup[] = [
  {
    label: "Planning",
    items: [
      { title: "Projections", url: "/planning", icon: <TrendingUp /> },
      { title: "Goals", url: "/goals", icon: <Target /> },
      { title: "Update Plan", url: "/setup", icon: <Settings /> },
    ],
  },
  {
    label: "Tracking",
    items: [
      { title: "Transactions", url: "/transactions", icon: <ArrowLeftRight /> },
      { title: "Accounts", url: "/accounts", icon: <Landmark /> },
    ],
  },
];

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout navGroups={navGroups}>{children}</AppLayout>;
}

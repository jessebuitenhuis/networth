import { cookies } from "next/headers";

import { SidebarLayout } from "@/components/layout/SidebarLayout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return <SidebarLayout defaultOpen={defaultOpen}>{children}</SidebarLayout>;
}

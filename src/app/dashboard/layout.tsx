import { DashboardLayout } from "@/components/layout/DashboardLayout ";
import { ReactNode } from "react";

export default function StudentLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout allowedRoles={["student"]}>{children}</DashboardLayout>
  );
}

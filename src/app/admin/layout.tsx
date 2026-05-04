import { DashboardLayout } from "@/components/layout/DashboardLayout ";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout allowedRoles={["superadmin", "admin"]}>
      {children}
    </DashboardLayout>
  );
}

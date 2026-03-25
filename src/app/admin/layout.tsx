import { DashboardLayout } from "@/components/layout/DashboardLayout ";
import { ReactNode } from "react";
// import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout allowedRoles={["superadmin", "admin"]}>
      {children}
    </DashboardLayout>
  );
}

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function AdminDashboardLayout({ children }) {
  return <DashboardLayout role="admin">{children}</DashboardLayout>;
}

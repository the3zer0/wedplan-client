import { DashboardLayout } from "@/components/dashboard/dashboard-layout";

export default function CustomerDashboardLayout({ children }) {
  return <DashboardLayout role="customer">{children}</DashboardLayout>;
}

import { CalendarDays, CheckCircle2, Clock3, DollarSign, Users } from "lucide-react";
import { DataTable } from "@/components/dashboard/data-table";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";

const overviewConfig = {
  vendor: { title: "Good morning, vendor", description: "Keep your services and booking requests moving beautifully.", stats: [["Active services", "0", "Publish your first service", StoreIcon], ["Pending requests", "0", "Waiting for your response", Clock3], ["This month", "$0", "No earnings yet", DollarSign]], columns: [{ key: "service", label: "Service" }, { key: "customer", label: "Customer" }, { key: "status", label: "Status" }] },
  customer: { title: "Your wedding, your way", description: "Everything you need for the next beautiful step.", stats: [["Saved services", "0", "Build your shortlist", CheckCircle2], ["Upcoming bookings", "0", "Your calendar is clear", CalendarDays], ["Planning progress", "0%", "Let’s get started", Clock3]], columns: [{ key: "service", label: "Service" }, { key: "date", label: "Event date" }, { key: "status", label: "Status" }] },
  admin: { title: "Admin overview", description: "Keep WedPlan safe, useful, and growing.", stats: [["Total users", "0", "No users loaded", Users], ["Active services", "0", "No services loaded", CheckCircle2], ["Transactions", "$0", "No transactions loaded", DollarSign]], columns: [{ key: "activity", label: "Activity" }, { key: "actor", label: "User" }, { key: "status", label: "Status" }] },
};

function StoreIcon(props) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M3 9h18M5 9v10h14V9M4 5h16l1 4H3l1-4Z" /><path d="M8 19v-5h8v5" /></svg>;
}

export function DashboardOverview({ role }) {
  const config = overviewConfig[role];
  return <><PageHeader eyebrow={`${role} workspace`} title={config.title} description={config.description} /><div className="grid gap-4 md:grid-cols-3">{config.stats.map(([label, value, detail, Icon]) => <StatCard key={label} label={label} value={value} detail={detail} icon={Icon} />)}</div><section className="mt-8"><h2 className="font-serif mb-4 text-2xl">Recent activity</h2><DataTable columns={config.columns} rows={[]} emptyTitle="Your workspace is ready" emptyDescription="Once you start using WedPlan, recent activity will appear here." /></section></>;
}

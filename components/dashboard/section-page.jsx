import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";

export function DashboardSectionPage({ role, title, description }) {
  return <><PageHeader eyebrow={`${role} workspace`} title={title} description={description} /><EmptyState title="Nothing here yet" description="This area is ready for your WedPlan data. Connect the API to start managing it." /></>;
}

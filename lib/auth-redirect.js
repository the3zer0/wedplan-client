export const roleDashboardPaths = {
  admin: "/dashboard/admin",
  vendor: "/dashboard/vendor",
  customer: "/dashboard/customer",
};

export function getSafeRedirect(value, role) {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value;
  return roleDashboardPaths[role] || roleDashboardPaths.customer;
}

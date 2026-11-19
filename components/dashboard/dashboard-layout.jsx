"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, CalendarDays, CreditCard, FilePlus2, Heart, LayoutDashboard, LogOut, Menu, Package, Settings, ShieldCheck, Store, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/shared/auth-provider";
import { RoleGuard } from "@/components/shared/role-guard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const navigation = {
  vendor: [
    ["Overview", "/dashboard/vendor", LayoutDashboard],
    ["My Services", "/dashboard/vendor/my-services", Store],
    ["Add Service", "/dashboard/vendor/add-service", FilePlus2],
    ["Booking Requests", "/dashboard/vendor/booking-requests", CalendarDays],
    ["Subscription", "/dashboard/vendor/subscription", CreditCard],
    ["Profile Settings", "/dashboard/vendor/profile-settings", Settings],
  ],
  customer: [
    ["Overview", "/dashboard/customer", LayoutDashboard],
    ["My Bookings", "/dashboard/customer/my-bookings", CalendarDays],
    ["Profile Settings", "/dashboard/customer/profile-settings", Settings],
  ],
  admin: [
    ["Overview", "/dashboard/admin", LayoutDashboard],
    ["Manage Users", "/dashboard/admin/manage-users", Users],
    ["Manage Services", "/dashboard/admin/manage-services", Package],
    ["Transactions", "/dashboard/admin/transactions", BarChart3],
  ],
};

function Brand() {
  return <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight"><span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground"><Heart className="size-4 fill-current" /></span>Wed<span className="text-primary">Plan</span></Link>;
}

function UserSummary({ user, role, compact = false }) {
  const initials = (user?.name || user?.email || "W").slice(0, 1).toUpperCase();
  return <div className={`flex items-center gap-3 ${compact ? "" : "border-t border-border/70 px-4 py-4"}`}><Avatar size={compact ? "sm" : "default"}><AvatarImage src={user?.image || undefined} alt={user?.name || "Profile"} /><AvatarFallback>{initials}</AvatarFallback></Avatar><div className="min-w-0"><p className="truncate text-sm font-medium">{user?.name || user?.email || "WedPlan user"}</p><p className="truncate text-xs capitalize text-muted-foreground">{role} account</p></div></div>;
}

function Navigation({ role, pathname, onNavigate }) {
  return <nav className="space-y-1 px-3">{(navigation[role] || []).map(([label, href, Icon]) => { const active = pathname === href || (href !== `/dashboard/${role}` && pathname.startsWith(`${href}/`)); return <Link key={href} href={href} onClick={onNavigate} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}><Icon className="size-4" />{label}</Link>; })}</nav>;
}

export function DashboardLayout({ role, children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      toast.error(error.message || "Unable to log out.");
    }
  }

  return <RoleGuard role={role}><div className="min-h-[calc(100vh-5rem)] bg-secondary/20"><aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-border/70 bg-background md:flex"><div className="flex h-20 items-center px-6"><Brand /></div><div className="flex-1 py-6"><p className="px-6 pb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Workspace</p><Navigation role={role} pathname={pathname} /></div><UserSummary user={user} role={role} /><Button variant="ghost" className="mx-3 mb-4 justify-start text-muted-foreground hover:text-destructive" onClick={handleLogout}><LogOut className="mr-3 size-4" />Log out</Button></aside><div className="md:pl-72"><header className="sticky top-20 z-20 flex h-16 items-center justify-between border-b border-border/70 bg-background/85 px-6 backdrop-blur-md md:hidden"><Sheet open={mobileOpen} onOpenChange={setMobileOpen}><SheetTrigger render={<Button variant="outline" size="icon" />}><Menu /><span className="sr-only">Open dashboard menu</span></SheetTrigger><SheetContent side="left" className="w-72 p-0"><SheetHeader className="border-b border-border/70 px-6 py-5"><SheetTitle><Brand /></SheetTitle><SheetDescription className="text-left">Your wedding planning workspace.</SheetDescription></SheetHeader><div className="py-6"><Navigation role={role} pathname={pathname} onNavigate={() => setMobileOpen(false)} /></div><div className="mt-auto"><UserSummary user={user} role={role} /><Button variant="ghost" className="mx-3 mb-4 w-[calc(100%-1.5rem)] justify-start text-muted-foreground hover:text-destructive" onClick={handleLogout}><LogOut className="mr-3 size-4" />Log out</Button></div></SheetContent></Sheet><div className="flex items-center gap-3"><ShieldCheck className="size-4 text-primary" /><span className="text-sm font-medium capitalize">{role} dashboard</span></div><UserSummary user={user} role={role} compact /></header><main className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">{children}</main></div></div></RoleGuard>;
}

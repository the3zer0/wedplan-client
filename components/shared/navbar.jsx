"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Heart, LayoutDashboard, LoaderCircle, LogOut, Menu, Settings } from "lucide-react";
import { useAuth } from "@/components/shared/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Browse Services" },
];

const roleDashboardPaths = {
  admin: "/dashboard/admin",
  vendor: "/dashboard/vendor",
  customer: "/dashboard/customer",
};

function Brand() {
  return <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight"><span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground"><Heart className="size-4 fill-current" /></span>Wed<span className="text-primary">Plan</span></Link>;
}

function ProfileMenu({ user, role, onSignOut }) {
  const dashboardPath = roleDashboardPaths[role] || "/dashboard";
  const profilePath = role ? `/dashboard/${role}/profile-settings` : "/profile-settings";
  const initials = (user.name || user.email || "W").slice(0, 1).toUpperCase();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" className="h-auto gap-2 rounded-full p-1 pr-3" />}>
        <Avatar size="sm"><AvatarImage src={user.image || undefined} alt={user.name || "Profile"} /><AvatarFallback>{initials}</AvatarFallback></Avatar>
        <span className="max-w-32 truncate text-sm font-medium">{user.name || user.email}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal"><p className="truncate font-medium">{user.name || "Your account"}</p><p className="truncate text-xs text-muted-foreground">{user.email}</p></DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href={dashboardPath} />}><LayoutDashboard />Dashboard</DropdownMenuItem>
        <DropdownMenuItem render={<Link href={profilePath} />}><Settings />Profile Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onSignOut}><LogOut />Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Navbar() {
  const { user, role, isPending, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    try {
      await signOut();
      router.replace("/");
      toast.success("You have been signed out.");
    } catch (error) {
      toast.error(error.message || "Unable to sign out.");
    }
  }

  const mobileLinks = user ? [...publicLinks, { href: roleDashboardPaths[role] || "/dashboard", label: "Dashboard" }, { href: role ? `/dashboard/${role}/profile-settings` : "/profile-settings", label: "Profile Settings" }] : publicLinks;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Brand />
          <div className="hidden items-center gap-8 md:flex">
            {publicLinks.map((link) => <Link key={link.href} href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{link.label}</Link>)}
            {isPending ? <LoaderCircle className="size-4 animate-spin text-primary" /> : user ? <ProfileMenu user={user} role={role} onSignOut={handleSignOut} /> : <div className="flex items-center gap-2"><Button variant="ghost" className="rounded-full" render={<Link href="/signin" />}>Sign In</Button><Button className="rounded-full px-5" render={<Link href="/signup" />}>Sign Up</Button></div>}
          </div>
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}><Menu /><span className="sr-only">Open menu</span></SheetTrigger>
            <SheetContent side="right" className="w-[ min(20rem,85vw)]">
              <SheetHeader><SheetTitle className="font-serif text-2xl">WedPlan</SheetTitle><SheetDescription>Plan every beautiful detail together.</SheetDescription></SheetHeader>
              <div className="flex flex-col gap-2 px-4">
                {mobileLinks.map((link) => <Link key={link.href} href={link.href} className="rounded-lg px-3 py-3 text-base text-foreground transition-colors hover:bg-secondary">{link.label}</Link>)}
                {isPending ? <LoaderCircle className="m-3 size-4 animate-spin text-primary" /> : user ? <Button variant="outline" className="mt-2 justify-start rounded-lg" onClick={handleSignOut}><LogOut className="mr-2 size-4" />Logout</Button> : <div className="mt-3 flex flex-col gap-2"><Button variant="outline" className="rounded-full" render={<Link href="/signin" />}>Sign In</Button><Button className="rounded-full" render={<Link href="/signup" />}>Sign Up</Button></div>}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}

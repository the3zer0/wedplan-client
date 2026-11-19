"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/components/shared/auth-provider";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSafeRedirect } from "@/lib/auth-redirect";

function isBlockedUser(user) {
  return user?.status === "blocked" || user?.isBlocked === true || user?.blocked === true;
}

function BlockedAccountMessage() {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-6 py-16">
      <Card className="w-full max-w-md border-destructive/20 text-center shadow-xl shadow-primary/5">
        <CardHeader><div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive"><ShieldAlert className="size-6" /></div><CardTitle className="font-serif text-3xl">Account blocked</CardTitle></CardHeader>
        <CardContent><p className="text-sm leading-6 text-muted-foreground">This account has been blocked. You have been logged out. Please contact support if you believe this is a mistake.</p></CardContent>
      </Card>
    </main>
  );
}

export function ProtectedRoute({ children, allowedRoles }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, isPending, signOut } = useAuth();
  const [blockedNotice, setBlockedNotice] = useState(false);
  const blocked = isBlockedUser(user);
  const hasRoleAccess = !allowedRoles?.length || allowedRoles.includes(role);

  useEffect(() => {
    function handleBlockedAccount() {
      void signOut();
      router.replace("/signin?blocked=1");
    }
    window.addEventListener("wedplan:blocked-account", handleBlockedAccount);
    if (blocked) {
      const noticeTimer = window.setTimeout(() => setBlockedNotice(true), 0);
      void signOut();
      window.removeEventListener("wedplan:blocked-account", handleBlockedAccount);
      return () => window.clearTimeout(noticeTimer);
    }
    if (isPending || blockedNotice) return;
    if (!user) {
      router.replace(`/signin?redirect=${encodeURIComponent(pathname || "/")}`);
      return;
    }
    if (user.roleSelected === false && pathname !== "/select-role") {
      router.replace(`/select-role?redirect=${encodeURIComponent(pathname || "/")}`);
      return;
    }
    if (!hasRoleAccess) router.replace(getSafeRedirect("", role));
    return () => window.removeEventListener("wedplan:blocked-account", handleBlockedAccount);
  }, [blocked, blockedNotice, hasRoleAccess, isPending, pathname, role, router, signOut, user]);

  if (blocked || blockedNotice) return <BlockedAccountMessage />;
  if (isPending || !user || !hasRoleAccess) return <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center"><LoadingSpinner label="Checking your account..." /></div>;
  return children;
}

export function RoleGuard({ role: requiredRole, children }) {
  return <ProtectedRoute allowedRoles={[requiredRole]}>{children}</ProtectedRoute>;
}

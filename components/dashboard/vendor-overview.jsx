"use client";

import { useEffect, useState } from "react";
import { Activity, CalendarCheck, CreditCard, LayoutList, PackageCheck } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Skeleton } from "@/components/ui/skeleton";

const statConfig = [
  ["Total Services", "totalServices", "Your service listings", LayoutList],
  ["Active Services", "activeServices", "Currently visible to couples", PackageCheck],
  ["Pending Booking Requests", "pendingBookingRequests", "Need your attention", Activity],
  ["Accepted Bookings", "acceptedBookings", "Confirmed celebrations", CalendarCheck],
  ["Current Subscription Plan", "subscriptionPlan", "Your vendor membership", CreditCard],
];

export function VendorOverview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    apiFetch("/vendor/services/stats").then((payload) => {
      if (active) setStats(payload?.stats || payload?.data || payload);
    }).catch((requestError) => {
      if (active) setError(requestError.message || "Unable to load your dashboard overview.");
    });
    return () => { active = false; };
  }, [retry]);

  return <><PageHeader eyebrow="Vendor workspace" title="Your business at a glance" description="Keep your services, bookings, and growth moving beautifully." />{error ? <EmptyState title="Overview unavailable" description={error} action={{ label: "Try again", onClick: () => { setError(""); setStats(null); setRetry((value) => value + 1); } }} /> : stats ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{statConfig.map(([label, key, detail, Icon]) => <StatCard key={key} label={label} value={stats[key] ?? "0"} detail={detail} icon={Icon} />)}</div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{statConfig.map(([label]) => <div key={label} className="rounded-xl border bg-background p-5"><Skeleton className="h-4 w-2/3" /><Skeleton className="mt-4 h-9 w-1/2" /><Skeleton className="mt-2 h-3 w-3/4" /></div>)}</div>}<div className="mt-8 rounded-2xl border border-primary/10 bg-secondary/20 p-6"><p className="text-sm text-muted-foreground">Your vendor dashboard is connected to the live WedPlan APIs. New activity will appear here as couples discover and book your services.</p></div></>;
}

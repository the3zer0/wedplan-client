"use client";

import { useEffect, useState } from "react";
import { CalendarClock, CalendarCheck, CalendarX, Inbox } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Skeleton } from "@/components/ui/skeleton";

const cards = [
  ["Total Booking Requests", "total", "All requests you have sent", Inbox],
  ["Pending", "pending", "Awaiting vendor response", CalendarClock],
  ["Accepted", "accepted", "Confirmed celebrations", CalendarCheck],
  ["Rejected", "rejected", "Requests not accepted", CalendarX],
];

export function CustomerOverview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    apiFetch("/customer/stats").then((payload) => {
      if (active) setStats(payload?.stats || payload?.data || payload);
    }).catch((requestError) => {
      if (active) setError(requestError.message || "Unable to load your booking overview.");
    });
    return () => { active = false; };
  }, [retry]);

  return <><PageHeader eyebrow="Customer workspace" title="Your wedding planning overview" description="Keep every vendor request and celebration detail in one place." />{error ? <EmptyState title="Overview unavailable" description={error} action={{ label: "Try again", onClick: () => { setError(""); setStats(null); setRetry((value) => value + 1); } }} /> : stats ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, key, detail, Icon]) => <StatCard key={key} label={label} value={stats[key] ?? "0"} detail={detail} icon={Icon} />)}</div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label]) => <div key={label} className="rounded-xl border bg-background p-5"><Skeleton className="h-4 w-2/3" /><Skeleton className="mt-4 h-9 w-1/2" /><Skeleton className="mt-2 h-3 w-3/4" /></div>)}</div>}</>;
}

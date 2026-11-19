"use client";

import { useEffect, useState } from "react";
import { CreditCard, FileClock, Handshake, Package, Users, UserRound } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Skeleton } from "@/components/ui/skeleton";

const cards = [
  ["Registered Users", "totalUsers", "All platform accounts", Users],
  ["Vendors", "totalVendors", "Service providers", UserRound],
  ["Customers", "totalCustomers", "Couples planning weddings", Handshake],
  ["Services", "totalServices", "Marketplace listings", Package],
  ["Pending Services", "pendingServices", "Awaiting moderation", FileClock],
  ["Transactions", "totalTransactions", "Payment records", CreditCard],
];

export function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    apiFetch("/admin/stats").then((payload) => { if (active) setStats(payload?.stats || payload?.data || payload); }).catch((requestError) => { if (active) setError(requestError.message || "Unable to load platform statistics."); });
    return () => { active = false; };
  }, [retry]);
  return <><PageHeader eyebrow="Admin workspace" title="Platform overview" description="Monitor the WedPlan marketplace and keep every workflow moving." />{error ? <EmptyState title="Statistics unavailable" description={error} action={{ label: "Try again", onClick: () => { setError(""); setStats(null); setRetry((value) => value + 1); } }} /> : stats ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label, key, detail, Icon]) => <StatCard key={key} label={label} value={stats[key] ?? "0"} detail={detail} icon={Icon} />)}</div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label]) => <div key={label} className="rounded-xl border bg-background p-5"><Skeleton className="h-4 w-2/3" /><Skeleton className="mt-4 h-9 w-1/2" /><Skeleton className="mt-2 h-3 w-3/4" /></div>)}</div>}</>;
}

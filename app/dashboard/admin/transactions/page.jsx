"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiFetch } from "@/lib/api";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";

const getTransactions = (payload) => payload?.transactions || payload?.data || [];
const getId = (transaction) => transaction._id || transaction.id;
function statusVariant(status) { return status === "paid" || status === "completed" ? "default" : status === "failed" || status === "cancelled" ? "destructive" : "secondary"; }
function formatAmount(transaction) {
  const amount = Number(transaction.amount || 0);
  if (!Number.isFinite(amount)) return "$0.00";
  const dollars = Number.isFinite(amount) && amount > 1000 ? amount / 100 : amount;
  return `$${dollars.toFixed(2)}`;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState(null);
  const [error, setError] = useState("");

  async function loadTransactions() {
    setError("");
    try { setTransactions(getTransactions(await apiFetch("/admin/transactions"))); } catch (requestError) { setError(requestError.message || "Unable to load transactions."); }
  }
  useEffect(() => {
    let active = true;
    apiFetch("/admin/transactions").then((payload) => { if (active) setTransactions(getTransactions(payload)); }).catch((requestError) => { if (active) setError(requestError.message || "Unable to load transactions."); });
    return () => { active = false; };
  }, []);

  return <div><PageHeader eyebrow="Admin workspace" title="Transactions" description="Review subscription payments and platform revenue records." />{error ? <EmptyState title="Transactions unavailable" description={error} action={{ label: "Try again", onClick: loadTransactions }} /> : !transactions ? <Card><CardContent className="space-y-4 p-6">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-12 w-full" />)}</CardContent></Card> : transactions.length === 0 ? <EmptyState title="No transactions yet" description="Payment records will appear here after vendors subscribe." /> : <Card><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Vendor</TableHead><TableHead>Plan</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader><TableBody>{transactions.map((transaction) => <TableRow key={getId(transaction)}><TableCell><p className="font-medium">{transaction.vendor?.name || transaction.vendor?.businessName || transaction.vendorName || "Vendor"}</p><p className="text-xs text-muted-foreground">{transaction.vendor?.email || transaction.email || "—"}</p></TableCell><TableCell className="capitalize">{transaction.plan || transaction.subscriptionPlan || "Premium"}</TableCell><TableCell>{formatAmount(transaction)}</TableCell><TableCell><Badge variant={statusVariant(transaction.status)}>{transaction.status || "pending"}</Badge></TableCell><TableCell>{transaction.createdAt || transaction.date ? new Date(transaction.createdAt || transaction.date).toLocaleDateString() : "—"}</TableCell></TableRow>)}</TableBody></Table></div></CardContent></Card>}</div>;
}

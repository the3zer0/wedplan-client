"use client";

import { useEffect, useState } from "react";
import { Check, Eye, Loader2, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const getServices = (payload) => payload?.services || payload?.data || [];
const getId = (service) => service.id;
function statusVariant(status) { return status === "approved" ? "default" : status === "rejected" ? "destructive" : "secondary"; }

export default function ManageServicesPage() {
  const [services, setServices] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [error, setError] = useState("");
  const [review, setReview] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState("");

  async function loadServices() {
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status !== "all") params.set("status", status);
      setServices(getServices(await apiFetch(`/admin/services?${params}`)));
    } catch (requestError) { setError(requestError.message || "Unable to load services."); }
  }

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status !== "all") params.set("status", status);
    apiFetch(`/admin/services?${params}`).then((payload) => {
      if (active) setServices(getServices(payload));
    }).catch((requestError) => {
      if (active) setError(requestError.message || "Unable to load services.");
    });
    return () => { active = false; };
  }, [search, status]);

  async function updateService(service, nextStatus) {
    const id = getId(service);
    setBusy(id);
    try {
      const result = await apiFetch(`/admin/services/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      const updated = result?.service || result?.data || { ...service, status: nextStatus };
      setServices((current) => current.map((item) => getId(item) === id ? { ...item, ...updated } : item));
      setReview(null);
      toast.success(`Service ${nextStatus}.`);
    } catch (requestError) { toast.error(requestError.message || "Unable to update service."); } finally { setBusy(""); }
  }

  async function deleteService() {
    const id = getId(deleting);
    setBusy(id);
    try {
      await apiFetch(`/admin/services/${id}`, { method: "DELETE" });
      setServices((current) => current.filter((service) => getId(service) !== id));
      setDeleting(null);
      toast.success("Service deleted.");
    } catch (requestError) { toast.error(requestError.message || "Unable to delete service."); } finally { setBusy(""); }
  }

  return (
    <div>
      <PageHeader eyebrow="Admin workspace" title="Manage services" description="Review listings, moderate quality, and keep the marketplace trustworthy." />
      <Card className="mb-6"><CardContent className="p-4">
        <form onSubmit={(event) => { event.preventDefault(); setSearch(searchInput.trim()); }} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search by service name" className="pl-9" /></div>
          <Select value={status} onValueChange={(value) => setStatus(value || "all")}><SelectTrigger className="w-full sm:w-44"><SelectValue placeholder="All statuses" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent></Select>
          <Button type="submit">Search</Button>
        </form>
      </CardContent></Card>
      {error ? <EmptyState title="Services unavailable" description={error} action={{ label: "Try again", onClick: loadServices }} /> : !services ? <Card><CardContent className="space-y-4 p-6">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-12 w-full" />)}</CardContent></Card> : services.length === 0 ? <EmptyState title="No services found" description="Try a different search or status filter." /> : (
        <Card><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Service</TableHead><TableHead>Vendor</TableHead><TableHead>Category</TableHead><TableHead>Approval</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>{services.map((service) => (
            <TableRow key={getId(service)}>
              <TableCell><p className="font-medium">{service.serviceName}</p><p className="text-xs text-muted-foreground">${service.price} · {service.location}</p></TableCell>
              <TableCell>{service.vendor?.businessName || service.vendor?.name || "Vendor"}</TableCell>
              <TableCell>{service.category}</TableCell>
              <TableCell><Badge variant={statusVariant(service.status)}>{service.status}</Badge></TableCell>
              <TableCell><div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => setReview(service)} aria-label="Review service"><Eye /></Button>
                {service.status !== "approved" && <Button variant="outline" size="sm" onClick={() => updateService(service, "approved")}><Check /> Approve</Button>}
                {service.status !== "rejected" && <Button variant="outline" size="sm" className="text-destructive" onClick={() => updateService(service, "rejected")}><X /> Reject</Button>}
                {service.status !== "pending" && <Button variant="outline" size="sm" onClick={() => updateService(service, "pending")}>Pending</Button>}
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleting(service)} aria-label="Delete service"><Trash2 /></Button>
              </div></TableCell>
            </TableRow>
          ))}</TableBody>
        </Table></div></CardContent></Card>
      )}
      <Dialog open={Boolean(review)} onOpenChange={(open) => !open && setReview(null)}><DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{review?.serviceName}</DialogTitle><DialogDescription>Review this listing before approving or rejecting it.</DialogDescription></DialogHeader>
        {review && <div className="grid gap-3 text-sm"><p>{review.description || "No description provided."}</p><div className="flex justify-between"><span className="text-muted-foreground">Category</span><span>{review.category}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Vendor</span><span>{review.vendor?.businessName || review.vendor?.name || "Vendor"}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant={statusVariant(review.status)}>{review.status}</Badge></div></div>}
        <DialogFooter>
          <Button onClick={() => updateService(review, "approved")} disabled={Boolean(busy)}><Check /> Approve</Button>
          <Button variant="destructive" onClick={() => updateService(review, "rejected")} disabled={Boolean(busy)}><X /> Reject</Button>
          <Button variant="outline" onClick={() => updateService(review, "pending")} disabled={Boolean(busy)}>Pending</Button>
          <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
        </DialogFooter>
      </DialogContent></Dialog>
      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}><DialogContent>
        <DialogHeader><DialogTitle>Delete this service?</DialogTitle><DialogDescription>This permanently removes {deleting?.serviceName || "the listing"} from the marketplace.</DialogDescription></DialogHeader>
        <DialogFooter><DialogClose render={<Button variant="outline" />}>Cancel</DialogClose><Button variant="destructive" onClick={deleteService} disabled={Boolean(busy)}>{busy ? <Loader2 className="animate-spin" /> : "Delete service"}</Button></DialogFooter>
      </DialogContent></Dialog>
    </div>
  );
}

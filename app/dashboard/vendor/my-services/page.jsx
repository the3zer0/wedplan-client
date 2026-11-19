"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Edit3, Loader2, Plus, Trash2 } from "lucide-react";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const categories = ["Photography & Videography", "Wedding Venues", "Decoration & Florist", "Catering Services", "Makeup & Styling", "Wedding Fashion"];
const imageLoader = ({ src }) => src;
const getServices = (payload) => payload?.services || payload?.data || [];
const getImage = (service) => service.images?.[0];

function statusVariant(status) {
  return status === "approved" ? "default" : status === "rejected" ? "destructive" : "secondary";
}

export default function MyServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busyId, setBusyId] = useState("");
  const [editBusy, setEditBusy] = useState(false);

  async function loadServices() {
    setError("");
    try { setServices(getServices(await apiFetch("/vendor/services"))); } catch (requestError) { setError(requestError.message || "Unable to load your services."); }
  }
  useEffect(() => {
    let active = true;
    apiFetch("/vendor/services").then((payload) => {
      if (active) setServices(getServices(payload));
    }).catch((requestError) => {
      if (active) setError(requestError.message || "Unable to load your services.");
    });
    return () => { active = false; };
  }, []);

  async function toggleAvailability(service) {
    const id = service.id;
    setBusyId(id);
    try {
      const isActive = !service.isActive;
      const updated = await apiFetch(`/vendor/services/${id}/availability`, { method: "PATCH", body: JSON.stringify({ isActive }) });
      const nextIsActive = updated?.service?.isActive ?? updated?.data?.isActive ?? isActive;
      const next = updated?.service || updated?.data || { ...service, isActive: nextIsActive };
      setServices((current) => current.map((item) => item.id === id ? { ...item, ...next, isActive: nextIsActive } : item));
      toast.success(`Service marked ${nextIsActive ? "available" : "unavailable"}.`);
    } catch (requestError) {
      const message = requestError.message || "Unable to update availability.";
      toast.error(message, requestError.status === 403 ? { action: { label: "View subscription", onClick: () => router.push("/dashboard/vendor/subscription") } } : undefined);
    } finally { setBusyId(""); }
  }

  async function saveEdit(event) {
    event.preventDefault();
    setEditBusy(true);
    const formData = new FormData(event.currentTarget);
    try {
      const id = editing.id;
      const updated = await apiFetch(`/vendor/services/${id}`, { method: "PATCH", body: JSON.stringify({ serviceName: formData.get("serviceName"), category: formData.get("category"), description: formData.get("description"), price: Number(formData.get("price")), location: formData.get("location") }) });
      const next = updated?.service || updated?.data || { ...editing, ...Object.fromEntries(formData.entries()) };
      setServices((current) => current.map((item) => item.id === id ? { ...item, ...next } : item));
      setEditing(null);
      toast.success("Service updated.");
    } catch (requestError) {
      const message = requestError.message || "Unable to update service.";
      toast.error(message, requestError.status === 403 ? { action: { label: "View subscription", onClick: () => router.push("/dashboard/vendor/subscription") } } : undefined);
    } finally { setEditBusy(false); }
  }

  async function deleteService() {
    const id = deleting.id;
    setBusyId(id);
    try {
      await apiFetch(`/vendor/services/${id}`, { method: "DELETE" });
      setServices((current) => current.filter((service) => service.id !== id));
      setDeleting(null);
      toast.success("Service deleted.");
    } catch (requestError) { toast.error(requestError.message || "Unable to delete service."); } finally { setBusyId(""); }
  }

  return <div><PageHeader eyebrow="Vendor workspace" title="My services" description="Keep your listings accurate, available, and ready to be discovered." action={{ label: "Add service", href: "/dashboard/vendor/add-service", icon: Plus }} />{error ? <EmptyState title="Services unavailable" description={error} action={{ label: "Try again", onClick: loadServices }} /> : !services ? <Card><CardContent className="p-6">Loading your services...</CardContent></Card> : services.length === 0 ? <EmptyState title="No services yet" description="Add your first service to start reaching couples on WedPlan." action={{ label: "Add service", href: "/dashboard/vendor/add-service" }} /> : <Card><CardContent className="p-0"><div className="hidden overflow-x-auto md:block"><Table><TableHeader><TableRow><TableHead>Service</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Approval</TableHead><TableHead>Availability</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{services.map((service) => { const id = service.id; return <TableRow key={id}><TableCell><div className="flex items-center gap-3">{getImage(service) && <Image loader={imageLoader} src={getImage(service)} alt="" width={48} height={48} unoptimized className="size-12 rounded-lg object-cover" />}<div><p className="font-medium">{service.serviceName}</p><p className="text-xs text-muted-foreground">{service.location}</p></div></div></TableCell><TableCell>{service.category}</TableCell><TableCell>${service.price}</TableCell><TableCell><Badge variant={statusVariant(service.status)}>{service.status}</Badge></TableCell><TableCell><Button variant="outline" size="sm" disabled={busyId === id} onClick={() => toggleAvailability(service)}>{busyId === id ? <Loader2 className="animate-spin" /> : service.isActive ? "Available" : "Unavailable"}</Button></TableCell><TableCell><div className="flex justify-end gap-2"><Button variant="ghost" size="icon" onClick={() => setEditing(service)} aria-label="Edit service"><Edit3 /></Button><Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleting(service)} aria-label="Delete service"><Trash2 /></Button></div></TableCell></TableRow>; })}</TableBody></Table></div><div className="grid gap-4 p-4 md:hidden">{services.map((service) => { const id = service.id; return <div key={id} className="rounded-xl border p-4"><div className="flex gap-3">{getImage(service) && <Image loader={imageLoader} src={getImage(service)} alt="" width={64} height={64} unoptimized className="size-16 rounded-lg object-cover" />}<div className="min-w-0 flex-1"><p className="truncate font-medium">{service.serviceName}</p><p className="text-sm text-muted-foreground">{service.category}</p><p className="mt-1 font-semibold">${service.price}</p></div><Badge variant={statusVariant(service.status)}>{service.status}</Badge></div><div className="mt-4 flex gap-2"><Button variant="outline" className="flex-1" disabled={busyId === id} onClick={() => toggleAvailability(service)}>{service.isActive ? "Available" : "Unavailable"}</Button><Button variant="outline" size="icon" onClick={() => setEditing(service)} aria-label="Edit service"><Edit3 /></Button><Button variant="outline" size="icon" className="text-destructive" onClick={() => setDeleting(service)} aria-label="Delete service"><Trash2 /></Button></div></div>; })}</div></CardContent></Card>}<Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Edit service</DialogTitle><DialogDescription>Update the details couples see on your listing.</DialogDescription></DialogHeader>{editing && <form onSubmit={saveEdit} className="space-y-4"><Input name="serviceName" defaultValue={editing.serviceName} placeholder="Service name" required /><Select name="category" defaultValue={editing.category}><SelectTrigger className="w-full"><SelectValue placeholder="Category" /></SelectTrigger><SelectContent>{categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent></Select><Textarea name="description" defaultValue={editing.description} rows={4} required /><Input name="price" type="number" min="1" defaultValue={editing.price} required /><Input name="location" defaultValue={editing.location} required /><DialogFooter><DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose><Button type="submit" disabled={editBusy}>{editBusy ? <Loader2 className="animate-spin" /> : "Save changes"}</Button></DialogFooter></form>}</DialogContent></Dialog><Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}><DialogContent><DialogHeader><DialogTitle>Delete this service?</DialogTitle><DialogDescription>This permanently removes {deleting?.serviceName || "the service"} from your listings.</DialogDescription></DialogHeader><DialogFooter><DialogClose render={<Button variant="outline" />}>Cancel</DialogClose><Button variant="destructive" onClick={deleteService} disabled={Boolean(busyId)}>{busyId ? <Loader2 className="animate-spin" /> : "Delete service"}</Button></DialogFooter></DialogContent></Dialog></div>;
}

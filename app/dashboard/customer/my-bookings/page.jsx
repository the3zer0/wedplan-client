"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CalendarDays, Eye, Loader2, MapPin, XCircle } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

const imageLoader = ({ src }) => src;
const getBookings = (payload) => payload?.bookings || payload?.data || [];
const getId = (booking) => booking.id;
function statusVariant(status) { return status === "accepted" ? "default" : status === "rejected" || status === "cancelled" ? "destructive" : "secondary"; }

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState("");
  const [details, setDetails] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [busy, setBusy] = useState("");

  async function loadBookings() {
    setError("");
    try { setBookings(getBookings(await apiFetch("/bookings/my"))); } catch (requestError) { setError(requestError.message || "Unable to load your bookings."); }
  }

  useEffect(() => {
    let active = true;
    apiFetch("/bookings/my").then((payload) => {
      if (active) setBookings(getBookings(payload));
    }).catch((requestError) => {
      if (active) setError(requestError.message || "Unable to load your bookings.");
    });
    return () => { active = false; };
  }, []);

  async function cancelBooking() {
    const id = getId(cancelling);
    setBusy(id);
    try {
      const result = await apiFetch(`/bookings/${id}/cancel`, { method: "PATCH" });
      const next = result?.booking || result?.data || { ...cancelling, status: "cancelled" };
      setBookings((current) => current.map((booking) => getId(booking) === id ? { ...booking, ...next, status: next.status || "cancelled" } : booking));
      setCancelling(null);
      toast.success("Booking request cancelled.");
    } catch (requestError) { toast.error(requestError.message || "Unable to cancel booking."); } finally { setBusy(""); }
  }

  return (
    <div>
      <PageHeader eyebrow="Customer workspace" title="My bookings" description="Follow your vendor requests from first message to confirmed celebration." />
      {error ? <EmptyState title="Bookings unavailable" description={error} action={{ label: "Try again", onClick: loadBookings }} /> : !bookings ? (
        <div className="grid gap-4 md:grid-cols-2">{[1, 2, 3].map((item) => <Card key={item}><CardContent className="flex gap-4 p-4"><Skeleton className="size-20 rounded-lg" /><div className="flex-1"><Skeleton className="h-5 w-2/3" /><Skeleton className="mt-3 h-4 w-1/2" /><Skeleton className="mt-3 h-8 w-1/3" /></div></CardContent></Card>)}</div>
      ) : bookings.length === 0 ? <EmptyState title="No booking requests yet" description="Browse wedding services and send your first request when you find the right vendor." action={{ label: "Browse services", href: "/services" }} /> : (
        <div className="grid gap-4 md:grid-cols-2">{bookings.map((booking) => (
          <Card key={getId(booking)}><CardContent className="p-4"><div className="flex gap-4">
            {(booking.service?.image || booking.service?.images?.[0]) && <Image loader={imageLoader} src={booking.service.image || booking.service.images[0]} alt="" width={88} height={88} unoptimized className="size-20 rounded-lg object-cover sm:size-22" />}
            <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h2 className="truncate font-heading text-lg font-semibold">{booking.service?.name || "Wedding service"}</h2><Badge variant={statusVariant(booking.status)}>{booking.status}</Badge></div>
              <p className="mt-1 text-sm text-muted-foreground">{booking.vendor?.businessName || booking.vendor?.name || "Vendor"}</p>
              <div className="mt-3 grid gap-1 text-sm text-muted-foreground"><span className="flex items-center gap-2"><CalendarDays className="size-4" />{new Date(booking.eventDate).toLocaleDateString()}</span><span className="flex items-center gap-2"><MapPin className="size-4" />{booking.eventLocation}</span></div>
            </div>
          </div><div className="mt-4 flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={() => setDetails(booking)}><Eye /> View details</Button>{booking.status === "pending" && <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setCancelling(booking)}><XCircle /> Cancel</Button>}</div></CardContent></Card>
        ))}</div>
      )}
      <Dialog open={Boolean(details)} onOpenChange={(open) => !open && setDetails(null)}><DialogContent>
        <DialogHeader><DialogTitle>{details?.service?.name || "Booking details"}</DialogTitle><DialogDescription>Booking request sent {details?.createdAt ? new Date(details.createdAt).toLocaleDateString() : "recently"}.</DialogDescription></DialogHeader>
        {details && <dl className="grid gap-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Vendor</dt><dd>{details.vendor?.businessName || details.vendor?.name || "Vendor"}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Event date</dt><dd>{new Date(details.eventDate).toLocaleDateString()}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Location</dt><dd>{details.eventLocation}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Status</dt><dd><Badge variant={statusVariant(details.status)}>{details.status}</Badge></dd></div><div><dt className="text-muted-foreground">Message</dt><dd className="mt-1 rounded-lg bg-muted/50 p-3">{details.message || "No additional message."}</dd></div></dl>}
        <DialogFooter><DialogClose render={<Button variant="outline" />}>Close</DialogClose></DialogFooter>
      </DialogContent></Dialog>
      <Dialog open={Boolean(cancelling)} onOpenChange={(open) => !open && setCancelling(null)}><DialogContent>
        <DialogHeader><DialogTitle>Cancel this booking request?</DialogTitle><DialogDescription>This will notify the vendor that you no longer need this booking.</DialogDescription></DialogHeader>
        <DialogFooter><DialogClose render={<Button variant="outline" />}>Keep request</DialogClose><Button variant="destructive" onClick={cancelBooking} disabled={Boolean(busy)}>{busy ? <Loader2 className="animate-spin" /> : "Cancel request"}</Button></DialogFooter>
      </DialogContent></Dialog>
    </div>
  );
}

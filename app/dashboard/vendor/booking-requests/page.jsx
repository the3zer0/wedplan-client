"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const getBookings = (payload) => payload?.bookings || payload?.data || [];
function statusVariant(status) { return status === "accepted" ? "default" : status === "rejected" ? "destructive" : "secondary"; }

export default function BookingRequestsPage() {
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState("");
  const [decision, setDecision] = useState(null);
  const [busyId, setBusyId] = useState("");

  async function loadBookings() {
    setError("");
    try { setBookings(getBookings(await apiFetch("/vendor/bookings"))); } catch (requestError) { setError(requestError.message || "Unable to load booking requests."); }
  }

  useEffect(() => {
    let active = true;
    apiFetch("/vendor/bookings").then((payload) => {
      if (active) setBookings(getBookings(payload));
    }).catch((requestError) => {
      if (active) setError(requestError.message || "Unable to load booking requests.");
    });
    return () => { active = false; };
  }, []);

  async function updateStatus() {
    const id = decision.booking.id;
    setBusyId(id);
    try {
      const action = decision.status === "accepted" ? "accept" : "reject";
      const result = await apiFetch(`/vendor/bookings/${id}/${action}`, { method: "PATCH" });
      const next = result?.booking || result?.data || { ...decision.booking, status: decision.status };
      setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, ...next } : booking));
      toast.success(`Booking ${action}ed.`);
      setDecision(null);
    } catch (requestError) { toast.error(requestError.message || "Unable to update booking."); } finally { setBusyId(""); }
  }

  function actions(booking) {
    if (booking.status !== "pending") return <Badge variant={statusVariant(booking.status)}>{booking.status}</Badge>;
    return <div className="flex gap-2"><Button size="sm" onClick={() => setDecision({ booking, status: "accepted" })}><Check /> Accept</Button><Button size="sm" variant="outline" className="text-destructive" onClick={() => setDecision({ booking, status: "rejected" })}><X /> Reject</Button></div>;
  }

  return (
    <div>
      <PageHeader eyebrow="Vendor workspace" title="Booking requests" description="Review each celebration request and respond with confidence." />
      {error ? <EmptyState title="Bookings unavailable" description={error} action={{ label: "Try again", onClick: loadBookings }} /> : !bookings ? <Card><CardContent className="p-6">Loading booking requests...</CardContent></Card> : bookings.length === 0 ? <EmptyState title="No booking requests" description="New requests from couples will appear here." /> : (
        <Card><CardContent className="p-0">
          <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Service</TableHead><TableHead>Event</TableHead><TableHead>Location</TableHead><TableHead>Message</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>{bookings.map((booking) => <TableRow key={booking.id}>
              <TableCell><p className="font-medium">{booking.customer?.name || "Unknown customer"}</p><p className="text-xs text-muted-foreground">{booking.customer?.email}</p></TableCell>
              <TableCell>{booking.service?.name || booking.service?.serviceName || "Service"}</TableCell>
              <TableCell>{new Date(booking.eventDate).toLocaleDateString()}</TableCell>
              <TableCell>{booking.eventLocation}</TableCell>
              <TableCell className="max-w-48 truncate">{booking.message || "—"}</TableCell>
              <TableCell>{actions(booking)}</TableCell>
            </TableRow>)}</TableBody>
          </Table></div>
        </CardContent></Card>
      )}
      <Dialog open={Boolean(decision)} onOpenChange={(open) => !open && setDecision(null)}><DialogContent>
        <DialogHeader><DialogTitle>{decision?.status === "accepted" ? "Accept booking request?" : "Reject booking request?"}</DialogTitle><DialogDescription>{decision?.status === "accepted" ? "The customer will be notified that you accepted this celebration." : "This will decline the request and notify the customer."}</DialogDescription></DialogHeader>
        <DialogFooter><DialogClose render={<Button variant="outline" />}>Cancel</DialogClose><Button variant={decision?.status === "rejected" ? "destructive" : "default"} onClick={updateStatus} disabled={Boolean(busyId)}>{busyId ? <Loader2 className="animate-spin" /> : decision?.status === "accepted" ? "Accept booking" : "Reject booking"}</Button></DialogFooter>
      </DialogContent></Dialog>
    </div>
  );
}

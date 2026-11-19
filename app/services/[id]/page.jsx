"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarDays, CheckCircle2, LoaderCircle, MapPin, ShieldCheck, UserRound } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/shared/auth-provider";
import { BookingForm } from "@/components/services/booking-form";
import { ProtectedRoute } from "@/components/shared/role-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function getImages(service) {
  return Array.isArray(service.images) ? [...new Set(service.images.filter(Boolean))] : [];
}

function ServiceDetailsContent() {
  const { id } = useParams();
  const { user, role } = useAuth();
  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    if (!id) return undefined;
    const controller = new AbortController();
    apiFetch(`/services/${id}`, { signal: controller.signal }).then((payload) => {
      setService(payload?.service || payload?.data || payload);
    }).catch((requestError) => {
      if (requestError.name !== "AbortError") setError(requestError.status === 404 ? "This service could not be found." : requestError.message || "We couldn't load this service.");
    }).finally(() => setIsLoading(false));
    return () => controller.abort();
  }, [id]);

  const images = useMemo(() => service ? getImages(service) : [], [service]);
  const vendor = service?.vendor || {};
  const vendorId = service?.vendorId || service?.vendor?.id || service?.vendor?._id;
  const isOwner = role === "vendor" && String(vendorId) === String(user?.id);
  const isAdmin = role === "admin";
  const isApproved = service?.status === "approved";
  const isActive = service?.isActive === true;
  const bookingReason = isAdmin ? "Admins cannot book services." : isOwner ? "Vendors cannot book their own services." : !isApproved ? "Only approved services can be booked." : !isActive ? "Only active services can be booked." : "";
  const price = service?.price ? `$${service.price}` : "Price on request";

  if (!id) return <main className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-2xl items-center justify-center px-6 text-center"><Card className="w-full border-dashed border-primary/30"><CardContent className="px-6 py-16"><h1 className="font-serif text-3xl">This service link is incomplete</h1><p className="mt-3 text-muted-foreground">Please return to the service directory and choose a service to view.</p><Button className="mt-6 rounded-full" render={<Link href="/services" />}>Browse services</Button></CardContent></Card></main>;
  if (isLoading) return <main className="flex min-h-[calc(100vh-9rem)] items-center justify-center"><LoaderCircle className="size-7 animate-spin text-primary" /></main>;
  if (error || !service) return <main className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-2xl items-center justify-center px-6 text-center"><Card className="w-full border-dashed border-primary/30"><CardContent className="px-6 py-16"><h1 className="font-serif text-3xl">We couldn&apos;t find that service</h1><p className="mt-3 text-muted-foreground">{error || "The service may have been removed or the link may be incorrect."}</p><Button className="mt-6 rounded-full" render={<Link href="/services" />}>Browse services</Button></CardContent></Card></main>;

  return <main className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16"><Link href="/services" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />Back to services</Link><div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]"><div>{images.length > 0 && <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-secondary"><Image src={images[selectedImage]} alt={service.serviceName} fill priority unoptimized sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" /></div>} {images.length > 1 && <div className="mt-4 flex gap-3 overflow-x-auto">{images.map((image, index) => <button key={image} type="button" onClick={() => setSelectedImage(index)} className={`relative size-20 shrink-0 overflow-hidden rounded-xl border-2 ${selectedImage === index ? "border-primary" : "border-transparent"}`}><Image src={image} alt="" fill unoptimized sizes="80px" className="object-cover" /></button>)}</div>}</div><div className="flex flex-col justify-center"><div className="flex flex-wrap items-center gap-2"><Badge>{service.category}</Badge><Badge variant="outline" className="capitalize">{service.status}</Badge>{!isActive && <Badge variant="secondary">Unavailable</Badge>}</div><h1 className="font-serif mt-5 text-5xl leading-tight">{service.serviceName}</h1><p className="mt-5 flex items-center gap-2 text-muted-foreground"><MapPin className="size-4 text-primary" />{service.location}</p><p className="mt-7 whitespace-pre-line leading-7 text-muted-foreground">{service.description}</p><div className="mt-8 flex items-center justify-between border-y border-border/70 py-5"><span className="text-sm text-muted-foreground">Starting from</span><span className="font-serif text-3xl text-primary">{price}</span></div><Card className="mt-6 border-primary/10 bg-secondary/20"><CardContent className="flex items-center gap-4 p-5"><div className="flex size-12 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">{vendor.image ? <Image src={vendor.image} alt="" width={48} height={48} unoptimized className="size-full object-cover" /> : <UserRound className="size-5" />}</div><div className="flex-1"><p className="font-medium">{vendor.businessName || vendor.name || "Verified vendor"}</p><p className="text-sm text-muted-foreground">Wedding professional</p></div>{vendor.premium && <Badge className="gap-1 bg-accent text-accent-foreground"><ShieldCheck className="size-3" />Premium</Badge>}</CardContent></Card>{bookingReason ? <div className="mt-6"><Button disabled className="w-full rounded-full">{bookingReason}</Button><p className="mt-2 text-center text-xs text-muted-foreground"><CheckCircle2 className="mr-1 inline size-3" />Booking availability is verified by WedPlan.</p></div> : <Button size="lg" className="mt-6 w-full rounded-full" onClick={() => setBookingOpen(true)}><CalendarDays className="mr-2 size-4" />Request to book</Button>}</div></div><Dialog open={bookingOpen} onOpenChange={setBookingOpen}><DialogContent><DialogHeader><DialogTitle className="font-serif text-3xl">Request to book</DialogTitle><DialogDescription>Tell {vendor.businessName || vendor.name || "this vendor"} about your celebration.</DialogDescription></DialogHeader><BookingForm serviceId={id} onSuccess={() => setBookingOpen(false)} /></DialogContent></Dialog></main>;
}

export default function ServiceDetailsPage() {
  return <ProtectedRoute><ServiceDetailsContent /></ProtectedRoute>;
}

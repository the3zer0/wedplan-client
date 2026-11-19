"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { ServiceCard, ServiceCardSkeleton, type Service } from "@/components/home/service-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const reveal = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.18 }, transition: { duration: 0.55, ease: "easeOut" as const } };

export function FeaturedServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [serviceError, setServiceError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    apiFetch("/services/featured", { signal: controller.signal }).then((payload) => {
      const items = Array.isArray(payload) ? payload : payload?.services || payload?.data || [];
      const eligible = Array.isArray(items) ? items.filter((service) => service.status === "approved" && service.isActive === true) : [];
      setServices(eligible);
    }).catch((error) => {
      if (error.name !== "AbortError") setServiceError(error.message || "We couldn't load featured services.");
    }).finally(() => setIsLoading(false));
    return () => controller.abort();
  }, []);

  return <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28"><motion.div {...reveal} className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Handpicked for you</p><h2 className="font-serif mt-3 text-4xl sm:text-5xl">Featured wedding services</h2><p className="mt-3 max-w-xl text-muted-foreground">Meet the talented people ready to help make your day unforgettable.</p></div><Link href="/services" className="text-sm font-medium text-primary hover:underline">View all services <ArrowRight className="ml-1 inline size-4" /></Link></motion.div>{isLoading ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <ServiceCardSkeleton key={index} />)}</div> : services.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{services.slice(0, 6).map((service) => <motion.div key={service.id} {...reveal}><ServiceCard service={service} /></motion.div>)}</div> : <Card className="border-dashed border-primary/30 bg-secondary/20"><CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center"><Sparkles className="mb-4 size-8 text-primary" /><h3 className="font-serif text-2xl">Your perfect vendors are on their way</h3><p className="mt-2 max-w-md text-sm text-muted-foreground">{serviceError || "We’re refreshing our featured collection. Explore all services to start planning today."}</p><Button className="mt-6 rounded-full" render={<Link href="/services" />}>Browse all services</Button></CardContent></Card>}</section>;
}

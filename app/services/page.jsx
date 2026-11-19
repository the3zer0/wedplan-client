"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { ServiceCard, ServiceCardSkeleton } from "@/components/home/service-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categories = ["Photography & Videography", "Wedding Venues", "Decoration & Florist", "Catering Services", "Makeup & Styling", "Wedding Fashion"];
const sortOptions = [["newest", "Newest"], ["price_asc", "Price: low to high"], ["price_desc", "Price: high to low"]];
const pageSize = 9;

function ServicesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchTimer = useRef(null);
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");
  const [loadedQuery, setLoadedQuery] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [retryKey, setRetryKey] = useState(0);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const location = searchParams.get("location") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const queryString = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (location) params.set("location", location);
    if (sort !== "newest") params.set("sort", sort);
    return params.toString();
  }, [category, location, page, search, sort]);
  const isLoading = loadedQuery !== queryString;

  const updateQuery = useCallback((key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.set("page", "1");
    const nextQuery = params.toString();
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const handleDebouncedQuery = useCallback((key, value) => {
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => updateQuery(key, value.trim()), 400);
  }, [updateQuery]);

  useEffect(() => () => {
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    apiFetch(`/services?${queryString}`, { signal: controller.signal }).then((payload) => {
      const items = Array.isArray(payload) ? payload : payload?.services || payload?.data?.services || payload?.data || [];
      const pagination = payload?.pagination || payload?.meta || {};
      const total = payload?.total ?? pagination.total ?? items.length;
      setServices(Array.isArray(items) ? items : []);
      setTotalPages(Math.max(1, payload?.totalPages || pagination.totalPages || Math.ceil(total / pageSize)));
    }).catch((requestError) => {
      if (requestError.name !== "AbortError") setError(requestError.message || "We couldn't load wedding services.");
    }).finally(() => setLoadedQuery(queryString));
    return () => controller.abort();
  }, [queryString, retryKey]);

  const hasFilters = Boolean(search || category || location);

  return <main className="mx-auto min-h-[calc(100vh-9rem)] max-w-7xl px-6 py-14 lg:px-10 lg:py-20">
    <div className="mb-10"><p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Find your perfect team</p><h1 className="font-serif mt-3 text-5xl">Wedding services</h1><p className="mt-3 max-w-2xl text-muted-foreground">Explore trusted professionals who care about every meaningful detail of your day.</p></div>
    <Card className="mb-10 border-primary/10 bg-card/80 shadow-sm"><CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input key={`search-${search}`} defaultValue={search} onChange={(event) => handleDebouncedQuery("search", event.target.value)} placeholder="Search by service name..." className="h-10 rounded-full pl-10" /></div><div className="relative flex-1"><SlidersHorizontal className="absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" /><Input key={`location-${location}`} defaultValue={location} onChange={(event) => handleDebouncedQuery("location", event.target.value)} placeholder="Filter by location..." className="h-10 rounded-full pl-10" /></div><Select value={category || null} onValueChange={(value) => updateQuery("category", value || "")}><SelectTrigger className="h-10 w-full rounded-full lg:w-64"><SelectValue placeholder="All categories" /></SelectTrigger><SelectContent><SelectItem value="">All categories</SelectItem>{categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select><Select value={sort} onValueChange={(value) => updateQuery("sort", value || "newest")}><SelectTrigger className="h-10 w-full rounded-full lg:w-56"><SelectValue placeholder="Sort services" /></SelectTrigger><SelectContent>{sortOptions.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select>{hasFilters && <Button variant="ghost" size="icon" className="shrink-0 rounded-full" onClick={() => router.push(pathname, { scroll: false })} aria-label="Clear filters"><X /></Button>}</CardContent></Card>
    {isLoading ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <ServiceCardSkeleton key={index} />)}</div> : error ? <Card className="border-destructive/20"><CardContent className="flex flex-col items-center px-6 py-16 text-center"><h2 className="font-serif text-2xl">We couldn&apos;t load the services</h2><p className="mt-2 max-w-md text-sm text-muted-foreground">{error}</p><Button className="mt-6 rounded-full" onClick={() => { setLoadedQuery(null); setRetryKey((value) => value + 1); }}>Try again</Button></CardContent></Card> : services.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{services.map((service) => <ServiceCard key={service.id} service={service} />)}</div> : <Card className="border-dashed border-primary/30 bg-secondary/20"><CardContent className="flex flex-col items-center px-6 py-16 text-center"><Search className="mb-4 size-8 text-primary" /><h2 className="font-serif text-2xl">No services found</h2><p className="mt-2 text-sm text-muted-foreground">{hasFilters ? "Try adjusting your search or clearing a filter." : "Check back soon for new wedding professionals."}</p>{hasFilters && <Button variant="outline" className="mt-6 rounded-full" onClick={() => router.push(pathname, { scroll: false })}>Clear filters</Button>}</CardContent></Card>}
    {totalPages > 1 && <Pagination className="mt-12"><PaginationContent><PaginationItem><PaginationPrevious href={page > 1 ? `${pathname}?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(page - 1) }).toString()}` : undefined} aria-disabled={page <= 1} /></PaginationItem>{Array.from({ length: Math.min(totalPages, 7) }, (_, index) => index + 1).map((pageNumber) => <PaginationItem key={pageNumber}><PaginationLink href={`${pathname}?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(pageNumber) }).toString()}`} isActive={pageNumber === page}>{pageNumber}</PaginationLink></PaginationItem>)}<PaginationItem><PaginationNext href={page < totalPages ? `${pathname}?${new URLSearchParams({ ...Object.fromEntries(searchParams.entries()), page: String(page + 1) }).toString()}` : undefined} aria-disabled={page >= totalPages} /></PaginationItem></PaginationContent></Pagination>}
  </main>;
}

export default function ServicesPage() {
  return <Suspense fallback={<main className="min-h-[calc(100vh-9rem)]" />}><ServicesContent /></Suspense>;
}

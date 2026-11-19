"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const categoryDecor = {
  "Photography & Videography": { tagline: "Freeze the feeling in every frame.", image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=700&q=80" },
  "Wedding Venues": { tagline: "Find a place for your forever.", image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=700&q=80" },
  "Decoration & Florist": { tagline: "Bring your beautiful vision to life.", image: "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=700&q=80" },
  "Catering Services": { tagline: "Delicious details everyone remembers.", image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=700&q=80" },
  "Makeup & Styling": { tagline: "Feel like the most radiant you.", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=700&q=80" },
  "Wedding Fashion": { tagline: "Dress for the moment and the memories.", image: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=700&q=80" },
};

const fallbackDecor = {
  tagline: "Discover trusted wedding professionals.",
  image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=700&q=80",
};

type Category = {
  name: string;
  count: number;
};

const reveal = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.18 }, transition: { duration: 0.55, ease: "easeOut" as const } };

export function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    apiFetch("/services/categories", { signal: controller.signal }).then((payload) => {
      const items = Array.isArray(payload?.categories) ? payload.categories : Array.isArray(payload) ? payload : [];
      setCategories(items.map((category: string | Category) => typeof category === "string" ? { name: category, count: 0 } : category));
    }).catch((requestError) => {
      if (requestError.name !== "AbortError") setError(requestError.message || "Unable to load categories.");
    }).finally(() => setIsLoading(false));
    return () => controller.abort();
  }, [retryKey]);

  function retryLoadingCategories() {
    setIsLoading(true);
    setError("");
    setRetryKey((value) => value + 1);
  }

  return (
    <section className="bg-secondary/30 px-6 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <motion.div {...reveal} className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">Find your inspiration</p>
          <h2 className="font-serif mt-3 text-4xl sm:text-5xl">Browse by category</h2>
        </motion.div>
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[1.25] w-full rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <Card className="border-destructive/20"><CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <h3 className="font-serif text-2xl">Categories unavailable</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">{error}</p>
            <Button className="mt-6 rounded-full" onClick={retryLoadingCategories}>Try again</Button>
          </CardContent></Card>
        ) : categories.length === 0 ? (
          <Card className="border-dashed border-primary/30"><CardContent className="px-6 py-16 text-center">
            <h3 className="font-serif text-2xl">No categories yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Wedding categories will appear when services are available.</p>
          </CardContent></Card>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const decor = categoryDecor[category.name as keyof typeof categoryDecor] || fallbackDecor;
              return (
                <motion.div key={category.name} {...reveal}>
                  <Link href={`/services?category=${encodeURIComponent(category.name)}`} className="group relative block aspect-[1.25] overflow-hidden rounded-2xl">
                    <Image src={decor.image} alt={category.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#251519]/85 via-[#251519]/15 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                      <h3 className="font-serif text-2xl">{category.name}</h3>
                      <p className="mt-1 text-sm text-white/75">{decor.tagline}</p>
                      <p className="mt-2 text-xs font-medium text-white/90">{category.count} {category.count === 1 ? "service" : "services"}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

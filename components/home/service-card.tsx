"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Tag, UserRound } from "lucide-react";
import { useAuth } from "@/components/shared/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export type Service = {
  id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number | string;
  location: string;
  images: string[];
  status: "pending" | "approved" | "rejected";
  isActive: boolean;
  vendor: { name?: string; businessName?: string; image?: string; premium: boolean };
};

type ServiceCardProps = {
  service: Service;
};

export function ServiceCard({ service }: ServiceCardProps) {
  const router = useRouter();
  const { user, isPending } = useAuth();
  const id = service.id || (service as Service & { _id?: string })._id;
  const category = service.category;
  const vendorName = service.vendor?.businessName || service.vendor?.name || "Verified vendor";
  const image = service.images?.[0];
  const price = service.price ? `$${service.price}` : "Price on request";
  const detailsPath = `/services/${id}`;

  function handleDetailsClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (isPending) return;
    if (!user) {
      event.preventDefault();
      router.push(`/signin?redirect=${encodeURIComponent(detailsPath)}`);
    }
  }

  return (
    <Card className="group overflow-hidden border-primary/10 bg-card/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {image && <Image src={image} alt={service.serviceName} fill unoptimized sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />}
        <Badge className="absolute left-3 top-3 bg-background/90 text-foreground backdrop-blur-sm">{category}</Badge>
      </div>
      <CardContent className="space-y-3 p-5">
        <div><h3 className="font-serif text-xl">{service.serviceName}</h3><p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><UserRound className="size-3.5 text-primary" />{vendorName}{service.vendor.premium && <Badge variant="secondary" className="ml-1">Premium</Badge>}</p></div>
        <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-1 text-muted-foreground"><MapPin className="size-3.5 text-primary" />{service.location}</span><span className="flex items-center gap-1 font-medium text-primary"><Tag className="size-3.5" />{price}</span></div>
      </CardContent>
      <CardFooter className="p-5 pt-0"><Button variant="outline" className="w-full rounded-full border-primary/20" render={<Link href={detailsPath} onClick={handleDetailsClick} />}>View Details</Button></CardFooter>
    </Card>
  );
}

export function ServiceCardSkeleton() {
  return <Card className="overflow-hidden border-primary/10"><Skeleton className="aspect-[4/3] rounded-none" /><CardContent className="space-y-4 p-5"><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2" /><div className="flex justify-between"><Skeleton className="h-4 w-2/5" /><Skeleton className="h-4 w-1/4" /></div></CardContent><CardFooter className="p-5 pt-0"><Skeleton className="h-9 w-full rounded-full" /></CardFooter></Card>;
}

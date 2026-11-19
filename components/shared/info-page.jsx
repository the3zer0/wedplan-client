import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function InfoPage({ eyebrow, title, description, children }) {
  return <main className="mx-auto max-w-4xl px-6 py-16 lg:px-10"><Button variant="ghost" className="mb-8" render={<Link href="/" />}><ArrowLeft /> Back home</Button><Card><CardContent className="p-8 sm:p-12"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p><h1 className="mt-3 font-heading text-4xl font-semibold">{title}</h1><p className="mt-4 max-w-2xl text-muted-foreground">{description}</p><div className="mt-8 space-y-6 text-sm leading-7 text-muted-foreground">{children}</div></CardContent></Card></main>;
}

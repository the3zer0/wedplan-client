import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() { return <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center"><p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">404</p><h1 className="font-serif text-5xl">This page wandered off.</h1><p className="text-muted-foreground">Let&apos;s get you back to your beautiful plans.</p><Link href="/" className={cn(buttonVariants(), "rounded-full")}>Return home</Link></main>; }

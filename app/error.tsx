"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main className="flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center"><p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Something went wrong</p><h1 className="font-serif text-5xl">We&apos;ll help you find your way.</h1><p className="max-w-md text-muted-foreground">An unexpected error interrupted this page. Please try again.</p><Button onClick={reset} className="rounded-full">Try again</Button></main>; }

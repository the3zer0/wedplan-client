"use client";

import { motion } from "framer-motion";
import { Clock3, HeartHandshake, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";

const benefits: Array<[LucideIcon, string, string]> = [
  [ShieldCheck, "Trusted professionals", "Every vendor is carefully reviewed so you can plan with confidence."],
  [HeartHandshake, "Made for your story", "Discover thoughtful services that fit your style, not someone else’s."],
  [Clock3, "Less searching, more celebrating", "Keep your planning focused, simple, and full of the good stuff."],
  [Sparkles, "Beautifully simple", "A calm experience from your first search to the final detail."],
];

const reveal = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.18 }, transition: { duration: 0.55, ease: "easeOut" as const } };

export function WhyChooseSection() {
  return <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28"><motion.div {...reveal} className="mb-10 text-center"><p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">The WedPlan difference</p><h2 className="font-serif mt-3 text-4xl sm:text-5xl">Why choose WedPlan?</h2></motion.div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{benefits.map(([Icon, title, description]) => <motion.div key={title} {...reveal} className="rounded-2xl border border-primary/10 bg-card p-6 shadow-sm"><span className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary"><Icon className="size-5" /></span><h3 className="font-serif mt-5 text-xl">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></motion.div>)}</div></section>;
}

"use client";

import { motion } from "framer-motion";
import { CalendarCheck, Check, HeartHandshake, Search, type LucideIcon } from "lucide-react";

const steps: Array<[string, LucideIcon, string, string]> = [
  ["01", Search, "Explore", "Browse a curated collection of wedding services made for your vision."],
  ["02", HeartHandshake, "Save your favorites", "Compare vendors, save ideas, and build your perfect shortlist."],
  ["03", CalendarCheck, "Connect", "Reach out to the people who can bring your celebration to life."],
  ["04", Check, "Celebrate", "Enjoy the planning journey knowing every detail is in good hands."],
];

const reveal = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.18 }, transition: { duration: 0.55, ease: "easeOut" as const } };

export function HowItWorksSection() {
  return <section className="bg-primary px-6 py-20 text-primary-foreground lg:px-10 lg:py-28"><div className="mx-auto max-w-7xl"><motion.div {...reveal} className="mb-12 text-center"><p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-200">A little less overwhelming</p><h2 className="font-serif mt-3 text-4xl sm:text-5xl">How WedPlan works</h2></motion.div><div className="grid gap-8 md:grid-cols-4">{steps.map(([number, Icon, title, description]) => <motion.div key={number} {...reveal} className="relative text-center md:text-left"><div className="mb-5 flex items-center justify-center gap-3 md:justify-start"><span className="font-serif text-3xl text-rose-200">{number}</span><span className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10"><Icon className="size-4" /></span></div><h3 className="font-serif text-2xl">{title}</h3><p className="mt-2 text-sm leading-6 text-white/70">{description}</p></motion.div>)}</div></div></section>;
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const reveal = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.18 }, transition: { duration: 0.55, ease: "easeOut" as const } };

export function HeroSection() {
  return <section className="relative isolate min-h-[620px] overflow-hidden"><Image src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=2200&q=90" alt="Elegant wedding table setting" fill priority sizes="100vw" className="-z-20 object-cover" /><div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#351f24]/90 via-[#351f24]/70 to-[#351f24]/40" /><motion.div {...reveal} className="relative mx-auto flex min-h-[620px] max-w-7xl items-center px-6 py-24 lg:px-10"><div className="max-w-2xl text-white"><Badge variant="outline" className="mb-6 border-white/40 bg-white/10 text-white backdrop-blur-sm"><Sparkles className="mr-2 size-3" />The beginning of something beautiful</Badge><h1 className="font-serif text-5xl leading-[1.05] tracking-tight drop-shadow-lg sm:text-7xl">Your forever starts with the <span className="italic text-rose-200">perfect details.</span></h1><p className="mt-7 max-w-xl text-lg leading-8 text-white/90 drop-shadow">Discover trusted wedding professionals, save your favorites, and plan a celebration that feels beautifully, unmistakably yours.</p><Button size="lg" className="mt-9 rounded-full bg-white px-7 text-primary shadow-xl hover:bg-rose-50" render={<Link href="/services" />}>Explore Wedding Services <ArrowRight className="ml-2 size-4" /></Button></div></motion.div></section>;
}

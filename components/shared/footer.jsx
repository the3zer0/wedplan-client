import Link from "next/link";
import { Globe2, Heart, Mail, MapPin, MessageCircle, Phone, SquareBookmark } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const COPYRIGHT_YEAR = "2026";

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-secondary/20">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_0.8fr_1fr_0.8fr]">
          <div><Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight"><span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground"><Heart className="size-4 fill-current" /></span>Wed<span className="text-primary">Plan</span></Link><p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">A calm, beautiful workspace for planning the celebration that feels just like you.</p><div className="mt-5 flex gap-2"><a href="https://instagram.com" aria-label="Instagram" className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"><Globe2 className="size-4" /></a><a href="https://facebook.com" aria-label="Facebook" className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"><MessageCircle className="size-4" /></a><a href="https://pinterest.com" aria-label="Pinterest" className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"><SquareBookmark className="size-4" /></a></div></div>
          <div><h2 className="text-sm font-semibold">Explore</h2><div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground"><Link href="/" className="hover:text-foreground">Home</Link><Link href="/services" className="hover:text-foreground">Browse Services</Link><Link href="/about" className="hover:text-foreground">Our Story</Link><Link href="/contact" className="hover:text-foreground">Contact</Link></div></div>
          <div><h2 className="text-sm font-semibold">Important</h2><div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground"><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link><Link href="/terms" className="hover:text-foreground">Terms of Service</Link><Link href="/help" className="hover:text-foreground">Help Center</Link></div></div>
          <div><h2 className="text-sm font-semibold">Say hello</h2><div className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground"><a href="mailto:hello@wedplan.com" className="flex items-center gap-2 hover:text-foreground"><Mail className="size-4 text-primary" />hello@wedplan.com</a><a href="tel:+15550148888" className="flex items-center gap-2 hover:text-foreground"><Phone className="size-4 text-primary" />+1 (555) 014-8888</a><span className="flex items-center gap-2"><MapPin className="size-4 text-primary" />Made with love, everywhere</span></div></div>
        </div>
        <Separator className="my-10 bg-border/70" />
        <p className="text-center text-xs text-muted-foreground">© {COPYRIGHT_YEAR} WedPlan. Made for every kind of love.</p>
      </div>
    </footer>
  );
}

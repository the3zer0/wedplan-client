import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PaymentCancelPage() {
  return <main className="mx-auto flex min-h-[65vh] max-w-2xl items-center justify-center px-6 py-16"><Card className="w-full shadow-lg"><CardContent className="p-8 text-center sm:p-12"><div className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary text-primary"><CreditCard className="size-8" /></div><h1 className="mt-6 font-heading text-3xl font-semibold">Payment cancelled</h1><p className="mt-4 text-muted-foreground">No payment was taken. You can return to your subscription page whenever you are ready to try again.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Button render={<Link href="/dashboard/vendor/subscription" />}><ArrowLeft /> Try again</Button><Button variant="outline" render={<Link href="/" />}>Back to home</Button></div></CardContent></Card></main>;
}

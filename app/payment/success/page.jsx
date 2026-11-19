"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [payment, setPayment] = useState(null);
  const [plan, setPlan] = useState("");
  const [error, setError] = useState("");
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
    let active = true;
    const pollSubscription = (attempt) => {
      apiFetch("/payments/vendor-subscription").then((payload) => {
        if (!active) return;
        const subscription = payload?.subscription || payload?.data || payload;
        const currentPlan = String(subscription?.plan || subscription?.currentPlan || "").toLowerCase();
        if (currentPlan === "premium") {
          setPlan("premium");
          setIsPolling(false);
        } else if (attempt < 10) {
          setTimeout(() => pollSubscription(attempt + 1), 2000);
        } else {
          setIsPolling(false);
        }
      }).catch(() => {
        if (active && attempt < 10) setTimeout(() => pollSubscription(attempt + 1), 2000);
        else if (active) setIsPolling(false);
      });
    };
    Promise.resolve().then(() => {
      if (!sessionId) {
        setError("We could not find a payment session. Please return to your subscription page and try again.");
        setIsPolling(false);
        return;
      }
      apiFetch(`/payments/session/${encodeURIComponent(sessionId)}`).then((payload) => {
        if (!active) return;
        setPayment(payload?.session || payload?.payment || payload?.data || payload);
        pollSubscription(1);
      }).catch((requestError) => {
        if (active) { setError(requestError.message || "We could not verify this payment session."); setIsPolling(false); }
      });
    });
    return () => { active = false; };
  }, [sessionId]);

  return <main className="mx-auto flex min-h-[65vh] max-w-2xl items-center justify-center px-6 py-16"><Card className="w-full border-primary/20 shadow-lg"><CardContent className="p-8 text-center sm:p-12"><div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary"><CheckCircle2 className="size-9" /></div><h1 className="mt-6 font-heading text-3xl font-semibold">Payment received</h1>{error ? <p className="mt-4 text-destructive">{error}</p> : <><p className="mt-4 text-muted-foreground">Your payment confirmation has been received{payment?.id ? ` for session ${payment.id}.` : "."}</p><p className="mt-3 text-sm text-muted-foreground">Premium access activates only after the payment is verified by the server. We are checking your subscription status now.</p>{isPolling && <p className="mt-5 flex items-center justify-center gap-2 text-sm text-primary"><Loader2 className="size-4 animate-spin" /> Verifying premium activation...</p>}{plan === "premium" && <p className="mt-5 font-medium text-primary">Your Premium plan is now active.</p>}</>}<Button className="mt-8" render={<Link href="/dashboard/vendor" />}>Go to vendor dashboard</Button></CardContent></Card></main>;
}

export default function PaymentSuccessPage() {
  return <Suspense fallback={<main className="flex min-h-[65vh] items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></main>}><SuccessContent /></Suspense>;
}

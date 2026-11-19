"use client";

import { useEffect, useState } from "react";
import { Check, Crown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const freeFeatures = ["Maximum 3 active services", "Basic dashboard", "Booking management"];
const premiumFeatures = ["Unlimited active services", "Premium vendor badge", "Everything in Free"];

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  async function loadSubscription() {
    setError("");
    try {
      const payload = await apiFetch("/payments/vendor-subscription");
      setSubscription(payload?.subscription || payload?.data || payload);
    } catch (requestError) { setError(requestError.message || "Unable to load subscription details."); }
  }
  useEffect(() => {
    let active = true;
    apiFetch("/payments/vendor-subscription").then((payload) => {
      if (active) setSubscription(payload?.subscription || payload?.data || payload);
    }).catch((requestError) => {
      if (active) setError(requestError.message || "Unable to load subscription details.");
    });
    return () => { active = false; };
  }, []);

  async function upgrade() {
    setBusy("upgrade");
    try {
      const result = await apiFetch("/payments/create-checkout-session", { method: "POST", body: JSON.stringify({ plan: "premium" }) });
      const url = result?.url || result?.checkoutUrl || result?.data?.url;
      if (!url) throw new Error("The checkout link was not returned by the server.");
      window.location.assign(url);
    } catch (requestError) { toast.error(requestError.message || "Unable to start checkout."); setBusy(""); }
  }

  async function cancel() {
    setBusy("cancel");
    try {
      await apiFetch("/payments/cancel-subscription", { method: "POST" });
      toast.success("Your subscription cancellation was requested.");
      await loadSubscription();
    } catch (requestError) { toast.error(requestError.message || "Unable to cancel subscription."); } finally { setBusy(""); }
  }

  const plan = String(subscription?.plan || subscription?.currentPlan || "free").toLowerCase();
  const isPremium = plan === "premium";
  const expiry = subscription?.expiresAt || subscription?.currentPeriodEnd || subscription?.expiryDate;

  return <div><PageHeader eyebrow="Vendor workspace" title="Subscription" description="Choose the plan that gives your wedding business room to grow." />{error ? <EmptyState title="Subscription unavailable" description={error} action={{ label: "Try again", onClick: loadSubscription }} /> : !subscription ? <Card><CardContent className="p-6">Loading subscription...</CardContent></Card> : <><Card className="mb-8 border-primary/20 bg-primary/5"><CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm text-muted-foreground">Current plan</p><div className="mt-1 flex items-center gap-2"><h2 className="font-heading text-2xl font-semibold capitalize">{plan}</h2>{isPremium && <Badge><Crown /> Premium vendor</Badge>}</div>{expiry && <p className="mt-1 text-sm text-muted-foreground">Renews or expires {new Date(expiry).toLocaleDateString()}</p>}</div>{isPremium && <Button variant="outline" onClick={cancel} disabled={busy === "cancel"}>{busy === "cancel" ? <Loader2 className="animate-spin" /> : "Cancel subscription"}</Button>}</CardContent></Card><div className="grid gap-6 md:grid-cols-2"><PlanCard title="Free" description="A thoughtful start for emerging vendors." features={freeFeatures} current={!isPremium} /><PlanCard title="Premium" description="More visibility and room for every celebration." features={premiumFeatures} current={isPremium} premium action={!isPremium && <Button onClick={upgrade} disabled={busy === "upgrade"}>{busy === "upgrade" ? <Loader2 className="animate-spin" /> : <><Crown /> Upgrade to Premium</>}</Button>} /></div></>}</div>;
}

function PlanCard({ title, description, features, current, premium, action }) {
  return <Card className={premium ? "border-primary shadow-md" : ""}><CardHeader><div className="flex items-center justify-between"><CardTitle>{title}</CardTitle>{current && <Badge variant="secondary">Current plan</Badge>}</div><p className="text-sm text-muted-foreground">{description}</p></CardHeader><CardContent><ul className="space-y-3">{features.map((feature) => <li key={feature} className="flex gap-2 text-sm"><Check className="size-4 shrink-0 text-primary" />{feature}</li>)}</ul>{action && <div className="mt-6">{action}</div>}</CardContent></Card>;
}

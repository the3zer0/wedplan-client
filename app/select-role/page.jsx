"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, UserRound } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/components/shared/auth-provider";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiFetch } from "@/lib/api";
import { getSafeRedirect } from "@/lib/auth-redirect";

const roleSelectionSchema = z.object({
  role: z.enum(["customer", "vendor"], { error: "Choose an account role." }),
  businessName: z.string().trim().optional(),
}).superRefine((values, context) => {
  if (values.role === "vendor" && !values.businessName) {
    context.addIssue({ code: "custom", path: ["businessName"], message: "Enter your business name." });
  }
});

function SelectRoleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";
  const { user, isPending, refreshUser } = useAuth();
  const form = useForm({
    resolver: zodResolver(roleSelectionSchema),
    defaultValues: { role: "customer", businessName: "" },
  });
  const role = useWatch({ control: form.control, name: "role" });

  useEffect(() => {
    if (isPending) return;
    if (!user) {
      router.replace(`/signin?redirect=${encodeURIComponent(getSafeRedirect(redirect, "customer"))}`);
      return;
    }
    if (user.roleSelected !== false) {
      router.replace(getSafeRedirect(redirect, user.role));
    }
  }, [isPending, redirect, router, user]);

  async function onSubmit(values) {
    try {
      await apiFetch("/users/me/role", {
        method: "POST",
        body: JSON.stringify(
  values.role === "vendor"
    ? { role: "vendor", businessName: values.businessName.trim() }
    : { role: "customer" },
),
      });
      toast.success("Your account role has been saved.");
      await refreshUser();
      router.replace(getSafeRedirect(redirect, values.role));
    } catch (error) {
      if (error.status === 403 && error.message === "Role already selected") {
        router.replace(getSafeRedirect("", user?.role));
        return;
      }
      toast.error(error.message || "Unable to save your account role.");
    }
  }

  if (isPending || !user || user.roleSelected !== false) {
    return <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center"><LoadingSpinner label="Checking your account..." /></div>;
  }

  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-6 py-16">
      <Card className="w-full max-w-md border-primary/10 shadow-xl shadow-primary/5">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground"><UserRound className="size-5" /></div>
          <CardTitle className="font-serif text-3xl">How will you use WedPlan?</CardTitle>
          <CardDescription>Choose your account role to finish setting up your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField control={form.control} name="role" render={({ field, fieldState }) => <FormItem><FormLabel>Account Role</FormLabel><Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Choose a role" /></SelectTrigger></FormControl><SelectContent><SelectItem value="customer">Customer</SelectItem><SelectItem value="vendor">Vendor</SelectItem></SelectContent></Select><FormMessage>{fieldState.error?.message}</FormMessage></FormItem>} />
            {role === "vendor" && <FormField control={form.control} name="businessName" render={({ field, fieldState }) => <FormItem><FormLabel>Business Name</FormLabel><FormControl><Input placeholder="Your studio or business name" {...field} /></FormControl><FormMessage>{fieldState.error?.message}</FormMessage></FormItem>} />}
            <Button type="submit" className="w-full rounded-full" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <LoaderCircle className="mr-2 size-4 animate-spin" />}Continue</Button>
          </form></Form>
        </CardContent>
      </Card>
    </main>
  );
}

export default function SelectRolePage() {
  return <Suspense fallback={<main className="min-h-[calc(100vh-5rem)]" />}><SelectRoleContent /></Suspense>;
}

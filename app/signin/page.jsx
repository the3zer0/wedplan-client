"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/components/shared/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { getSafeRedirect } from "@/lib/auth-redirect";

const signInSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

function SignInContent() {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "";
  const wasBlocked = searchParams.get("blocked") === "1";
  const form = useForm({ resolver: zodResolver(signInSchema), defaultValues: { email: "", password: "" } });

  async function onSubmit(values) {
    const result = await signIn(values);
    if (result.error) {
      toast.error(result.error.message || "Unable to sign in.");
      return;
    }
    toast.success("Welcome back to WedPlan.");
    router.push(getSafeRedirect(redirect, result.data?.user?.role));
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    const callbackPath = `/select-role?redirect=${encodeURIComponent(getSafeRedirect(redirect, "customer"))}`;
    const result = await signInWithGoogle({ callbackURL: `${window.location.origin}${callbackPath}` });
    if (result.error) {
      setIsGoogleLoading(false);
      toast.error(result.error.message || "Unable to continue with Google.");
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-6 py-16">
      <Card className="w-full max-w-md border-primary/10 shadow-xl shadow-primary/5">
        <CardHeader className="text-center"><div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground"><LogIn className="size-5" /></div><CardTitle className="font-serif text-3xl">Welcome back</CardTitle><CardDescription>Sign in to continue planning your beautiful day.</CardDescription>{wasBlocked && <p className="pt-2 text-sm font-medium text-destructive">This account is blocked. Contact support for help.</p>}</CardHeader>
        <CardContent className="space-y-5">
          <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="email" render={({ field, fieldState }) => <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" autoComplete="email" {...field} /></FormControl><FormMessage>{fieldState.error?.message}</FormMessage></FormItem>} />
            <FormField control={form.control} name="password" render={({ field, fieldState }) => <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" autoComplete="current-password" {...field} /></FormControl><FormMessage>{fieldState.error?.message}</FormMessage></FormItem>} />
            <Button type="submit" className="w-full rounded-full" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <LoaderCircle className="mr-2 size-4 animate-spin" />}Sign In</Button>
          </form></Form>
          <div className="relative flex items-center"><span className="w-full border-t" /><span className="absolute left-1/2 -translate-x-1/2 bg-card px-3 text-xs text-muted-foreground">OR</span></div>
          <Button variant="outline" className="w-full rounded-full" onClick={handleGoogleSignIn} disabled={isGoogleLoading}>{isGoogleLoading && <LoaderCircle className="mr-2 size-4 animate-spin" />}Continue with Google</Button>
          <p className="text-center text-sm text-muted-foreground">New to WedPlan? <Link href={`/signup${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`} className="font-medium text-primary hover:underline">Create an account</Link></p>
        </CardContent>
      </Card>
    </main>
  );
}

export default function SignInPage() {
  return <Suspense fallback={<main className="min-h-[calc(100vh-5rem)]" />}><SignInContent /></Suspense>;
}

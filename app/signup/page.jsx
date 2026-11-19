"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, LoaderCircle, UserPlus } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/components/shared/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSafeRedirect } from "@/lib/auth-redirect";
import { apiFetch } from "@/lib/api";

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters.").regex(/[A-Z]/, "Include at least one uppercase letter.").regex(/[a-z]/, "Include at least one lowercase letter."),
  role: z.enum(["vendor", "customer"], { error: "Choose an account role." }),
  businessName: z.string().trim().optional(),
}).superRefine((values, context) => {
  if (values.role === "vendor" && !values.businessName) context.addIssue({ code: "custom", path: ["businessName"], message: "Enter your business name." });
});

function SignUpContent() {
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();
  const [preview, setPreview] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const redirect = useSearchParams().get("redirect") || "";
  const form = useForm({ resolver: zodResolver(signUpSchema), defaultValues: { name: "", email: "", password: "", role: "customer", businessName: "", image: "" } });
  const role = useWatch({ control: form.control, name: "role" });

  async function handleImageChange(event, onChange) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setProfileFile(file);
    setPreview(URL.createObjectURL(file));
    onChange("");
  }

  async function onSubmit(values) {
    const result = await signUp({ ...values, businessName: values.role === "vendor" ? values.businessName : undefined });
    if (result.error) {
      toast.error(result.error.message || "Unable to create your account.");
      return;
    }
    if (profileFile) {
      try {
        const body = new FormData();
        body.append("file", profileFile);
        const payload = await apiFetch("/upload", { method: "POST", body });
        if (!payload?.url) throw new Error("The upload server did not return an image URL.");
        await apiFetch("/users/me", { method: "PATCH", body: JSON.stringify({ image: payload.url }) });
      } catch (error) {
        toast.error(error.message || "The profile image upload failed.");
      }
    }
    toast.success("Your WedPlan account is ready.");
    router.push(getSafeRedirect(redirect, result.data?.user?.role || values.role));
  }

  async function handleGoogleSignUp() {
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
      <Card className="w-full max-w-2xl border-primary/10 shadow-xl shadow-primary/5">
        <CardHeader className="text-center"><div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground"><UserPlus className="size-5" /></div><CardTitle className="font-serif text-3xl">Create your WedPlan</CardTitle><CardDescription>Start turning your wedding dreams into a beautiful plan.</CardDescription></CardHeader>
        <CardContent className="space-y-5">
          <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5 md:grid-cols-2">
            <FormField control={form.control} name="name" render={({ field, fieldState }) => <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input autoComplete="name" {...field} /></FormControl><FormMessage>{fieldState.error?.message}</FormMessage></FormItem>} />
            <FormField control={form.control} name="email" render={({ field, fieldState }) => <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" autoComplete="email" {...field} /></FormControl><FormMessage>{fieldState.error?.message}</FormMessage></FormItem>} />
            <FormField control={form.control} name="password" render={({ field, fieldState }) => <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" autoComplete="new-password" {...field} /></FormControl><p className="text-xs text-muted-foreground">At least 6 characters, including uppercase and lowercase.</p><FormMessage>{fieldState.error?.message}</FormMessage></FormItem>} />
            <FormField control={form.control} name="role" render={({ field, fieldState }) => <FormItem><FormLabel>Account Role</FormLabel><Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Choose a role" /></SelectTrigger></FormControl><SelectContent><SelectItem value="customer">Customer</SelectItem><SelectItem value="vendor">Vendor</SelectItem></SelectContent></Select><FormMessage>{fieldState.error?.message}</FormMessage></FormItem>} />
            {role === "vendor" && <FormField control={form.control} name="businessName" render={({ field, fieldState }) => <FormItem className="md:col-span-2"><FormLabel>Business Name</FormLabel><FormControl><Input placeholder="Your studio or business name" {...field} /></FormControl><FormMessage>{fieldState.error?.message}</FormMessage></FormItem>} />}
            <FormField control={form.control} name="image" render={({ field, fieldState }) => <FormItem className="md:col-span-2"><FormLabel>Profile Image <span className="font-normal text-muted-foreground">(optional)</span></FormLabel><div className="flex items-center gap-4"><div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-primary/40 bg-secondary">{preview ? <Image src={preview} alt="Profile preview" width={64} height={64} unoptimized className="size-full object-cover" /> : <ImagePlus className="size-5 text-primary" />}</div><div className="flex-1"><FormControl><Input type="file" accept="image/*" onChange={(event) => handleImageChange(event, field.onChange)} /></FormControl><p className="mt-1 text-xs text-muted-foreground">JPG, PNG, or WEBP up to your server limit.</p></div></div><FormMessage>{fieldState.error?.message}</FormMessage></FormItem>} />
            <Button type="submit" className="md:col-span-2 w-full rounded-full" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <LoaderCircle className="mr-2 size-4 animate-spin" />}Create account</Button>
          </form></Form>
          <div className="relative flex items-center"><span className="w-full border-t" /><span className="absolute left-1/2 -translate-x-1/2 bg-card px-3 text-xs text-muted-foreground">OR</span></div>
          <Button variant="outline" className="w-full rounded-full" onClick={handleGoogleSignUp} disabled={isGoogleLoading}>{isGoogleLoading && <LoaderCircle className="mr-2 size-4 animate-spin" />}Sign up with Google</Button>
          <p className="text-center text-sm text-muted-foreground">Already have an account? <Link href={`/signin${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`} className="font-medium text-primary hover:underline">Sign in</Link></p>
        </CardContent>
      </Card>
    </main>
  );
}

export default function SignUpPage() {
  return <Suspense fallback={<main className="min-h-[calc(100vh-5rem)]" />}><SignUpContent /></Suspense>;
}

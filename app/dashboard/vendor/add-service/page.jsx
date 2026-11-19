"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Loader2, UploadCloud, X } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const categories = ["Photography & Videography", "Wedding Venues", "Decoration & Florist", "Catering Services", "Makeup & Styling", "Wedding Fashion"];
const schema = z.object({
  serviceName: z.string().trim().min(2, "Service name must be at least 2 characters."),
  category: z.string().min(1, "Choose a category."),
  description: z.string().trim().min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().positive("Price must be greater than 0."),
  location: z.string().trim().min(2, "Location is required."),
});

export default function AddServicePage() {
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [limitError, setLimitError] = useState("");
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { serviceName: "", category: "", description: "", price: "", location: "" } });

  useEffect(() => () => files.forEach(({ preview }) => URL.revokeObjectURL(preview)), [files]);

  function addFiles(event) {
    const selected = Array.from(event.target.files || []).filter((file) => file.type.startsWith("image/"));
    setFiles((current) => [...current, ...selected.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
    event.target.value = "";
  }

  function removeFile(index) {
    setFiles((current) => { URL.revokeObjectURL(current[index].preview); return current.filter((_, itemIndex) => itemIndex !== index); });
  }

  async function onSubmit(values) {
    if (files.length === 0) {
      toast.error("Add at least one service image.");
      return;
    }
    setIsSubmitting(true);
    setLimitError("");
    try {
      const imageUrls = await Promise.all(files.map(async ({ file }) => {
        const body = new FormData();
        body.append("file", file);
        const result = await apiFetch("/upload", { method: "POST", body });
        return result.url;
      }));
      await apiFetch("/vendor/services", { method: "POST", body: JSON.stringify({ serviceName: values.serviceName, category: values.category, description: values.description, price: values.price, location: values.location, images: imageUrls.filter(Boolean) }) });
      toast.success("Service submitted for approval.");
      form.reset();
      files.forEach(({ preview }) => URL.revokeObjectURL(preview));
      setFiles([]);
    } catch (error) {
      const message = error.message || "Unable to create this service.";
      if (message.toLowerCase().includes("limit") || message.toLowerCase().includes("free plan")) setLimitError(message);
      else toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return <div className="max-w-3xl"><PageHeader eyebrow="Vendor workspace" title="Add a service" description="Share the beautiful work you offer with couples planning their celebration." /><Card><CardContent className="p-6"><Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6"><div className="grid gap-6 sm:grid-cols-2"><FormField control={form.control} name="serviceName" render={({ field }) => <FormItem><FormLabel>Service Name</FormLabel><FormControl><Input placeholder="Elegant garden wedding photography" {...field} /></FormControl><FormMessage>{form.formState.errors.serviceName?.message}</FormMessage></FormItem>} /><FormField control={form.control} name="category" render={({ field }) => <FormItem><FormLabel>Category</FormLabel><Select value={field.value} onValueChange={field.onChange}><FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Choose a category" /></SelectTrigger></FormControl><SelectContent>{categories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent></Select><FormMessage>{form.formState.errors.category?.message}</FormMessage></FormItem>} /><FormField control={form.control} name="price" render={({ field }) => <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" min="1" step="0.01" placeholder="2500" {...field} /></FormControl><FormMessage>{form.formState.errors.price?.message}</FormMessage></FormItem>} /><FormField control={form.control} name="location" render={({ field }) => <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="Dhaka, Bangladesh" {...field} /></FormControl><FormMessage>{form.formState.errors.location?.message}</FormMessage></FormItem>} /></div><FormField control={form.control} name="description" render={({ field }) => <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={6} placeholder="Tell couples what makes your service special..." {...field} /></FormControl><FormMessage>{form.formState.errors.description?.message}</FormMessage></FormItem>} /><div className="space-y-3"><div><FormLabel>Service Images</FormLabel><p className="text-sm text-muted-foreground">Add at least one image to showcase your work.</p></div><label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-primary/30 bg-secondary/20 p-8 text-center hover:bg-secondary/40"><UploadCloud className="mb-2 size-8 text-primary" /><span className="font-medium">Choose images</span><span className="text-sm text-muted-foreground">PNG, JPG, or WEBP</span><input type="file" accept="image/*" multiple className="sr-only" onChange={addFiles} /></label>{files.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{files.map(({ preview }, index) => <div key={preview} className="group relative overflow-hidden rounded-lg border"><Image src={preview} alt="" width={180} height={120} className="aspect-square w-full object-cover" unoptimized /><button type="button" onClick={() => removeFile(index)} className="absolute right-1 top-1 rounded-full bg-background/90 p-1 text-muted-foreground hover:text-destructive" aria-label="Remove image"><X className="size-4" /></button></div>)}</div>}</div>{limitError && <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"><p className="font-semibold">Free plan service limit reached</p><p className="mt-1">{limitError}</p><Button render={<Link href="/dashboard/vendor/subscription" />} className="mt-3">Upgrade to Premium</Button></div>}<Button type="submit" disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="animate-spin" /> Uploading and saving...</> : <><ImagePlus /> Submit Service</>}</Button></form></Form></CardContent></Card></div>;
}

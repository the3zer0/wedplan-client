"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const bookingSchema = z.object({
  eventDate: z.string().refine((value) => value && new Date(`${value}T00:00:00`) > new Date(), "Choose a future event date."),
  eventLocation: z.string().trim().min(3, "Enter the event location."),
  message: z.string().trim().max(1000, "Keep your message under 1000 characters.").optional(),
});

export function BookingForm({ serviceId, onSuccess }) {
  const form = useForm({ resolver: zodResolver(bookingSchema), defaultValues: { eventDate: "", eventLocation: "", message: "" } });
  const today = new Date().toISOString().slice(0, 10);

  async function onSubmit(values) {
    try {
      const result = await apiFetch("/bookings", { method: "POST", body: JSON.stringify({ serviceId, ...values }) });
      if (result?.error) throw new Error(result.error.message || "Unable to submit your booking.");
      toast.success("Booking request sent.");
      form.reset();
      onSuccess();
    } catch (error) {
      if (error.status === 409) toast.error("You already have a booking request for this service.");
      else toast.error(error.message || "Unable to submit your booking.");
    }
  }

  return <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <FormField control={form.control} name="eventDate" render={({ field, fieldState }) => <FormItem><FormLabel>Event Date</FormLabel><FormControl><Input type="date" min={today} {...field} /></FormControl><FormMessage>{fieldState.error?.message}</FormMessage></FormItem>} />
    <FormField control={form.control} name="eventLocation" render={({ field, fieldState }) => <FormItem><FormLabel>Event Location</FormLabel><FormControl><Input placeholder="Venue, city, or address" {...field} /></FormControl><FormMessage>{fieldState.error?.message}</FormMessage></FormItem>} />
    <FormField control={form.control} name="message" render={({ field, fieldState }) => <FormItem><FormLabel>Additional Message <span className="font-normal text-muted-foreground">(optional)</span></FormLabel><FormControl><Textarea placeholder="Tell the vendor a little about your celebration..." {...field} /></FormControl><FormMessage>{fieldState.error?.message}</FormMessage></FormItem>} />
    <Button type="submit" className="w-full rounded-full" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting && <LoaderCircle className="mr-2 size-4 animate-spin" />}Send booking request</Button>
  </form></Form>;
}

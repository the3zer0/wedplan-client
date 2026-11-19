"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, UploadCloud, UserRound, X } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/components/shared/auth-provider";
import { apiFetch } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  businessName: z.string().trim().optional(),
});

export function ProfileSettings({ role }) {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.resolve().then(() => {
      if (!user) return;
      setName(user.name || "");
      setBusinessName(user.businessName || "");
      setPreview(user.image || "");
      setIsLoading(false);
    });
  }, [user]);
  useEffect(() => () => { if (preview.startsWith("blob:")) URL.revokeObjectURL(preview); }, [preview]);

  function chooseFile(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith("image/")) { toast.error("Please choose an image file."); return; }
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function saveProfile(event) {
    event.preventDefault();
    const parsed = profileSchema.safeParse({ name, businessName: role === "vendor" ? businessName : undefined });
    if (!parsed.success) { toast.error(parsed.error.issues[0]?.message || "Please check your details."); return; }
    setIsSaving(true);
    try {
      let image;
      if (file) {
        const body = new FormData();
        body.append("file", file);
        const upload = await apiFetch("/upload", { method: "POST", body });
        image = upload?.url;
        if (!image) throw new Error("The image URL was not returned by the server.");
      }
      await apiFetch("/users/me", { method: "PATCH", body: JSON.stringify({ name: parsed.data.name, ...(role === "vendor" ? { businessName: parsed.data.businessName || "" } : {}), ...(image ? { image } : {}) }) });
      await refreshUser?.();
      setFile(null);
      toast.success("Profile updated successfully.");
    } catch (error) { toast.error(error.message || "Unable to update your profile."); } finally { setIsSaving(false); }
  }

  if (isLoading) return <div className="mx-auto max-w-2xl"><Card><CardContent className="p-6">Loading profile settings...</CardContent></Card></div>;
  return <div className="mx-auto max-w-2xl"><PageHeader eyebrow={`${role} workspace`} title="Profile settings" description="Keep your WedPlan profile current so couples know who they are booking." /><Card><CardContent className="p-6"><form onSubmit={saveProfile} className="space-y-6"><div className="flex flex-col items-center gap-4 sm:flex-row"><div className="relative flex size-24 items-center justify-center overflow-hidden rounded-full bg-secondary">{preview ? <Image src={preview} alt="Profile preview" fill unoptimized className="object-cover" /> : <UserRound className="size-10 text-muted-foreground" />}</div><div className="space-y-2"><Label htmlFor="profile-image">Profile image</Label><label htmlFor="profile-image" className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-secondary"><UploadCloud className="size-4" /> Choose image</label><input id="profile-image" type="file" accept="image/*" className="sr-only" onChange={chooseFile} />{file && <button type="button" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive" onClick={() => { if (preview.startsWith("blob:")) URL.revokeObjectURL(preview); setFile(null); setPreview(user.image || ""); }}><X className="size-3" /> Remove new image</button>}</div></div><div className="grid gap-5"><div className="space-y-2"><Label htmlFor="profile-name">Full name</Label><Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} required /></div><div className="space-y-2"><Label htmlFor="profile-email">Email</Label><Input id="profile-email" value={user?.email || ""} readOnly disabled /></div>{role === "vendor" && <div className="space-y-2"><Label htmlFor="business-name">Business name</Label><Input id="business-name" value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder="Your wedding business" /></div>}</div><p className="text-xs text-muted-foreground">Role and subscription changes are managed by the platform and cannot be changed here.</p><Button type="submit" disabled={isSaving}>{isSaving ? <><Loader2 className="animate-spin" /> Saving changes...</> : "Save changes"}</Button></form></CardContent></Card></div>;
}

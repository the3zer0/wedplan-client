import { LoaderCircle } from "lucide-react";

export function LoadingSpinner({ label = "Loading" }: { label?: string }) {
  return <div role="status" className="flex items-center justify-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin text-primary" /><span>{label}</span></div>;
}

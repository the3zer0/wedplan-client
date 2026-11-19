import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PageHeader({ eyebrow, title, description, action }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow || "Workspace"}</p><h1 className="mt-2 font-serif text-4xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>}</div>{action && <Button className="rounded-full" render={action.href ? <Link href={action.href} /> : undefined} onClick={action.onClick}>{action.label}</Button>}</div>;
}

import Link from "next/link";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ title, description, action }) {
  return <div className="flex flex-col items-center rounded-2xl border border-dashed border-primary/25 bg-background px-6 py-16 text-center"><span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary"><Inbox className="size-5" /></span><h2 className="mt-5 font-serif text-2xl">{title}</h2><p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>{action && <Button className="mt-6 rounded-full" render={action.href ? <Link href={action.href} /> : undefined} onClick={action.onClick}>{action.label}</Button>}</div>;
}

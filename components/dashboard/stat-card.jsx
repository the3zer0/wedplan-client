import { Card, CardContent } from "@/components/ui/card";

export function StatCard({ label, value, detail, icon: Icon }) {
  return <Card className="border-primary/10 shadow-sm"><CardContent className="flex items-start justify-between p-5"><div><p className="text-sm text-muted-foreground">{label}</p><p className="font-serif mt-2 text-3xl">{value}</p>{detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}</div>{Icon && <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-primary"><Icon className="size-5" /></span>}</CardContent></Card>;
}

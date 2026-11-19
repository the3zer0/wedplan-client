import Link from "next/link";
import { InfoPage } from "@/components/shared/info-page";
export default function HelpPage() { return <InfoPage eyebrow="Help center" title="Let us make planning easier" description="Find a service, send a request, and keep every detail in one calm workspace."><p>For account or booking help, contact <Link className="font-medium text-primary hover:underline" href="mailto:hello@wedplan.com">hello@wedplan.com</Link>. Vendors can manage services and subscriptions from their dashboard.</p></InfoPage>; }

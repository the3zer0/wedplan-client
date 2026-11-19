import Link from "next/link";
import { InfoPage } from "@/components/shared/info-page";
export default function ContactPage() { return <InfoPage eyebrow="Say hello" title="We are here to help" description="Have a question about WedPlan? Our team would love to hear from you."><p>Email us at <Link className="font-medium text-primary hover:underline" href="mailto:hello@wedplan.com">hello@wedplan.com</Link> and we will get back to you as soon as possible.</p></InfoPage>; }

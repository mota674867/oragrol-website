import type { Metadata } from "next";
import ContactPageClient from "./contact-client";

export const metadata: Metadata = {
  title: "Contact | Start a Conversation with ORAGROL Global",
  description:
    "Start with a clear conversation about cybersecurity, business automation or OR ONE. ORAGROL Global responds to qualified enquiries within two business days.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact | ORAGROL Global",
    description:
      "Choose your conversation — cybersecurity, business automation, OR ONE, or a general enquiry — and start with a considered response, not an automated sales pitch.",
    url: "/contact",
    siteName: "ORAGROL Global",
    locale: "en_CA",
    type: "website",
  },
};

export default function Page() {
  return <ContactPageClient />;
}

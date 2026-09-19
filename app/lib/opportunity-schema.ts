import { z } from "zod";

/**
 * Server-side validation for the shared /careers, /talent and
 * /partnerships submission form (`OragrolOpportunityPage` — one component,
 * three pages, see `app/components/site/oragrol-opportunity-page.tsx`).
 *
 * The form renders a different set of optional fields depending on
 * `page`/`category` (specialty, applying-as, discipline, proposed region,
 * etc. — see that component's `field(...)` calls), so this schema only
 * enforces what's universally required across every variant: the
 * identity/contact fields and a non-empty description. Everything else
 * arrives as free-form key/value pairs in the request's `fields` JSON and
 * is rendered into the notification email as-is (informational only —
 * never stored, never used for authorization), so a page/category variant
 * added later doesn't need this schema updated to keep working end to
 * end — it just needs `/api/opportunity/route.ts`'s FIELD_LABELS updated
 * for a nicer label, which is optional.
 */
export const opportunityPageSchema = z.enum(["careers", "talent", "partnerships"]);
export type OpportunityPage = z.infer<typeof opportunityPageSchema>;

export const PAGE_LABEL: Record<OpportunityPage, string> = {
  careers: "Careers",
  talent: "Talent",
  partnerships: "Partnership",
};

export const opportunitySchema = z.object({
  page: opportunityPageSchema,
  category: z.string().trim().min(1, "Missing category.").max(100),
  fullName: z.string().trim().min(1, "Enter your name.").max(200),
  email: z.string().trim().min(1, "Enter your email.").email("Enter a valid email address."),
  country: z.string().trim().min(1, "Enter your country.").max(100),
  city: z.string().trim().min(1, "Enter your city.").max(100),
  phoneCountryCode: z.string().trim().min(1, "Enter your phone country code.").max(6),
  phone: z.string().trim().min(1, "Enter your phone number.").max(50),
  description: z.string().trim().min(1, "Tell us more.").max(12000),
});

export type OpportunityInput = z.infer<typeof opportunitySchema>;

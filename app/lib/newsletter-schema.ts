import { z } from "zod";

/**
 * Server-side validation for the footer Newsletter signup
 * (app/components/site/footer.tsx). Mirrors opportunity-schema.ts's
 * shape/convention. Only email is truly required — the form's firstName
 * field has no `required` attribute, so a signup with just an email must
 * still succeed.
 */
export const newsletterSchema = z.object({
  firstName: z.string().trim().max(200).optional().default(""),
  email: z.string().trim().min(1, "Enter your email.").email("Enter a valid email address.").max(320),
  consent: z.literal(true, { message: "Consent is required." }),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

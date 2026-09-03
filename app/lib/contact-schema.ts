import { z } from "zod";

/**
 * Shared validation for the Contact page's "General Inquiry" form —
 * one schema used both client-side (`GeneralInquiry`, via
 * `@hookform/resolvers/zod`) and server-side (`/api/contact`'s
 * authoritative check, since client-side validation is never trusted
 * on its own). `zod`/`react-hook-form` were already project
 * dependencies (unused until now) — reused rather than hand-rolling
 * validation or adding a different form library.
 */
export const generalInquirySchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(200),
  email: z.string().trim().min(1, "Enter your email.").email("Enter a valid email address."),
  // Optional per the brief ("Company (optional)") — an empty string from
  // the form is a valid, non-required value, not a validation failure.
  // Deliberately no `.transform()` here: zod's inferred type for a
  // transformed field is its OUTPUT shape, which diverges from the form's
  // INPUT shape and breaks `useForm<GeneralInquiryInput>`'s generic
  // (react-hook-form/zodResolver expect input and output to match unless
  // you thread through separate input/output generics). Blank vs.
  // provided is handled at render time in the API route instead.
  company: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1, "Enter a message.").max(5000),
});

export type GeneralInquiryInput = z.infer<typeof generalInquirySchema>;

/**
 * Validation for the GPT-redesigned Contact page's enquiry form
 * (app/contact/contact-client.tsx) — POSTed to /api/contact alongside
 * `generalInquirySchema` above (still used by the old, now-orphaned
 * general-inquiry.tsx component; left untouched rather than repurposed,
 * so this is a separate, additive schema, not a replacement). Field
 * names match the form's own `name` attributes exactly.
 */
export const contactEnquirySchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name.").max(100),
  lastName: z.string().trim().min(1, "Enter your last name.").max(100),
  email: z.string().trim().min(1, "Enter your email.").email("Enter a valid email address."),
  company: z.string().trim().min(1, "Enter your company.").max(200),
  jobTitle: z.string().trim().max(200).optional(),
  companySize: z.string().trim().max(50).optional(),
  conversation: z.string().trim().min(1).max(100),
  context: z.string().trim().min(1, "Tell us what you'd like to achieve.").max(5000),
  contactMethod: z.string().trim().max(50).optional(),
  preferredTime: z.string().trim().max(200).optional(),
  // Short summary of any ScopeTray selections attached at submit time —
  // built client-side from localStorage state, not itself sensitive.
  scopeSummary: z.string().trim().max(1000).optional(),
});

export type ContactEnquiryInput = z.infer<typeof contactEnquirySchema>;

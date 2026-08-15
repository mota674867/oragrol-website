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

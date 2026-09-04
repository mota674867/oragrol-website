import { z } from "zod";

/**
 * Validation for "My Scope" — the lightweight lead-capture form inside
 * the scope tray (app/components/ScopeTray.tsx), embedded on Services,
 * Business Automation and OR ONE. Deliberately much lighter than the
 * Cyber Health Assessment's schema (cyber-health-schema.ts): this is a
 * quick "someone picked items and wants a conversation" capture, not a
 * 42-question assessment, so only name/email/phone are actually
 * required. Company, timeframe and notes add useful context but were
 * never the point — don't block the submit on them.
 */
const scopeItemSchema = z.object({
  id: z.string().trim().min(1).max(100),
  area: z.enum(["Cybersecurity", "Automation", "OR ONE"]),
  code: z.string().trim().max(50).optional(),
  title: z.string().trim().min(1).max(300),
  detail: z.string().trim().max(1000).optional(),
  commercial: z.string().trim().max(200).optional(),
});

export const scopeSubmissionSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(200),
  email: z.string().trim().min(1, "Enter your email.").email("Enter a valid email address."),
  phone: z.string().trim().min(1, "Enter a phone number.").max(50),
  company: z.string().trim().max(200).optional(),
  timeframe: z.string().trim().max(50).optional(),
  notes: z.string().trim().max(2000).optional(),
  items: z.array(scopeItemSchema).min(1, "Select at least one item before submitting."),
  // Which page the tray was open on when they submitted (e.g.
  // "/services", "/business-automation", "/or-one") — this plus the
  // fixed "My Scope" tag is how the CRM note answers "which channel did
  // this lead come from," same idea as Cyber Health's own report source.
  pageOrigin: z.string().trim().max(200).optional(),
});

export type ScopeSubmissionInput = z.infer<typeof scopeSubmissionSchema>;

import { z } from "zod";

/**
 * Validation for the Cyber Health assessment submission
 * (app/cyber-health/cyber-health-client.tsx) — POSTed to
 * /api/cyber-health once someone reaches the result screen. Field names
 * match the client's own `Profile` type and `answers`/`qual` state keys.
 */
export const cyberHealthProfileSchema = z.object({
  company: z.string().trim().min(1, "Company name is required.").max(200),
  industry: z.string().trim().min(1, "Industry is required.").max(100),
  province: z.string().trim().min(1, "Province is required.").max(100),
  employees: z.string().trim().min(1, "Employee count is required.").max(50),
  platform: z.string().trim().min(1, "Cloud platform is required.").max(50),
  name: z.string().trim().min(3, "Contact name is required.").max(200),
  email: z.string().trim().min(1, "Business email is required.").email("Enter a valid email address."),
  phone: z.string().trim().min(1, "Phone is required.").max(50),
});

export const cyberHealthAnswerSchema = z.enum(["Yes", "No", "Not Sure"]);

export const cyberHealthSubmissionSchema = z.object({
  profile: cyberHealthProfileSchema,
  qualification: z.record(z.string(), z.string()).default({}),
  answers: z.record(z.string(), cyberHealthAnswerSchema),
});

export type CyberHealthSubmissionInput = z.infer<typeof cyberHealthSubmissionSchema>;

import { z } from "zod";

/**
 * Validation for "My Scope" — both the "Download My Scope PDF" and
 * "Submit for Private Review" actions inside the scope tray
 * (app/components/ScopeTray.tsx), embedded on Services, Business
 * Automation and OR ONE.
 *
 * Rebuilt 2026-09-09 against My_Scope_Final_Ready_For_Claude.md's
 * Section 4 data contract and Section 1's locked field requirements.
 * Two real changes from the previous version, not just a company
 * tweak:
 *
 * 1. `company` is now REQUIRED (previously optional) — both actions
 *    require name, email, phone AND company. Only timeframe/context
 *    stay optional, and neither action may be blocked on them.
 *
 * 2. `selections` replaces the old client-trusted `items` array.
 *    Per Section 4: "Never trust browser-supplied prices, titles,
 *    tier calculations or codes as authoritative... Resolve IDs on
 *    the server against the actual catalog." The client now sends
 *    only IDs (and, for OR ONE, the selected capability IDs within
 *    that area); the server route is responsible for resolving each
 *    ID against the real catalog (Services/BA/OR ONE capability
 *    registry) into the actual area/code/name/commercial before it
 *    ever reaches a PDF, email, or HubSpot note. This schema
 *    validates shape only — it cannot and does not validate that an
 *    ID actually exists in the catalog; that resolution + rejection
 *    of unknown IDs happens in the /api/scope route itself.
 *
 * `intent` distinguishes the two actions this schema now serves —
 * previously there was only one (fake) submit path. See the intent/
 * priority table in Section 1 of the handoff for what each drives.
 */

const scopeSelectionSchema = z.object({
  // Stable catalog id as already used by ScopeTray today, e.g.
  // "cyber:C01-S04", "cyber-package:foundation", "automation:sales-flow".
  id: z.string().trim().min(1).max(200),
  // OR ONE only: the individual capability codes selected within that
  // area (see app/lib/or-one-capability-registry.ts), so the server can
  // resolve real per-capability identities instead of just a count.
  // Absent/empty for non-OR-ONE selections.
  capabilityCodes: z.array(z.string().trim().min(1).max(20)).max(77).optional(),
});

export const scopeIntentSchema = z.enum(["pdf_download", "review_requested"]);
export type ScopeIntent = z.infer<typeof scopeIntentSchema>;

export const scopeSubmissionSchema = z.object({
  // Stable per-action id, supplied by the client, reused across retries
  // of the SAME action so the server can dedupe safely. A NEW action
  // (e.g. a review request after an earlier download) must generate a
  // new requestId, not reuse the previous one.
  requestId: z.string().uuid("Invalid request id."),
  intent: scopeIntentSchema,

  name: z.string().trim().min(1, "Enter your name.").max(200),
  email: z.string().trim().min(1, "Enter your email.").email("Enter a valid email address."),
  phone: z.string().trim().min(1, "Enter a phone number.").max(50),
  company: z.string().trim().min(1, "Enter your company name.").max(200),

  // Optional context — never block either action on these.
  timeframe: z.string().trim().max(50).optional(),
  context: z.string().trim().max(2000).optional(),

  selections: z
    .array(scopeSelectionSchema)
    .min(1, "Select at least one item before submitting."),

  // Approved site path only (e.g. "/services", "/business-automation",
  // "/or-one") — no query string or fragment. Used for the CRM note's
  // "source page" line, same idea as Cyber Health's report-source field.
  sourcePath: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^\/[a-z0-9\-/]*$/, "Invalid source path.")
    .refine((p) => !p.includes("?") && !p.includes("#"), "Source path must not include a query or fragment."),

  // Truthful-disclosure tracking per Section 5 — the disclosure text
  // shown beside the form ("Your details and selected scope will be
  // shared with ORAGROL...") has its own version, and the client must
  // have shown/acknowledged it before this submission is valid.
  disclosureVersion: z.string().trim().min(1).max(20),
  acknowledged: z.literal(true, {
    message: "You must acknowledge the disclosure before submitting.",
  }),
});

export type ScopeSubmissionInput = z.infer<typeof scopeSubmissionSchema>;

import { z } from "zod";

/**
 * Validation for POST /api/chat (app/api/chat/route.ts) — the ORAGROL
 * chat widget's backend. Two request shapes share one endpoint:
 *
 * - `mode: "reply"` — the visitor sent a normal message; the widget
 *   sends recent conversation history and gets back an AI-generated
 *   reply grounded in chat-knowledge.ts.
 * - `mode: "escalate"` — the widget's own local urgent/human-request
 *   detector fired (see ChatWidget.tsx) and the visitor has now
 *   supplied contact info; this logs a real lead (email to the team +
 *   HubSpot sync), it does not call the AI.
 */
const chatMessageSchema = z.object({
  role: z.enum(["visitor", "oragrol"]),
  text: z.string().trim().min(1).max(4000),
});

export const chatReplySchema = z.object({
  mode: z.literal("reply"),
  messages: z.array(chatMessageSchema).min(1).max(30),
});

export const chatEscalateSchema = z.object({
  mode: z.literal("escalate"),
  name: z.string().trim().min(1, "Enter your name.").max(200),
  email: z.string().trim().min(1, "Enter your email.").email("Enter a valid email address."),
  reason: z.enum(["urgent", "human-requested"]),
  // Last few turns of the conversation, for context in the alert email
  // and CRM note — not re-sent to the AI on this path.
  transcript: z.array(chatMessageSchema).max(30).optional(),
});

export const chatRequestSchema = z.discriminatedUnion("mode", [chatReplySchema, chatEscalateSchema]);

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;

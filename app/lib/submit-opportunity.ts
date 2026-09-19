"use client";

import type { ApplicationPayload } from "../components/site/oragrol-opportunity-page";

/**
 * Shared submit handler for /careers, /talent and /partnerships — POSTs
 * to the single /api/opportunity route (mirrors OragrolOpportunityPage's
 * own one-component-for-three-pages pattern). Used by careers-client.tsx,
 * talent-client.tsx and partnerships-client.tsx so the fetch/error logic
 * lives in exactly one place.
 *
 * Sent as multipart/form-data, not JSON, because Careers submissions
 * carry real PDF attachments that must travel as actual files.
 */
export async function submitOpportunity(payload: ApplicationPayload): Promise<void> {
  const form = new FormData();
  form.set("page", payload.page);
  form.set("category", payload.category);
  form.set("fields", JSON.stringify(payload.fields));
  payload.files.forEach((file) => form.append("documents", file));

  const res = await fetch("/api/opportunity", { method: "POST", body: form });
  const data: { ok: boolean; error?: string } = await res
    .json()
    .catch(() => ({ ok: false, error: "Unexpected response." }));

  if (!res.ok || !data.ok) {
    throw new Error(data.error || "Could not send your submission. Please try again.");
  }
}

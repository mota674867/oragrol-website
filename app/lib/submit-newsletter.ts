"use client";

/**
 * Client-side fetch wrapper for the footer Newsletter signup — mirrors
 * submit-opportunity.ts's pattern. Used as SiteFooter's (footer.tsx)
 * default `onSubscribe` implementation.
 *
 * JSON, not multipart — no file uploads in this form.
 */
export async function submitNewsletter(payload: { firstName: string; email: string; consent: true }): Promise<void> {
  const res = await fetch("/api/newsletter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data: { ok: boolean; error?: string } = await res
    .json()
    .catch(() => ({ ok: false, error: "Unexpected response." }));

  if (!res.ok || !data.ok) {
    throw new Error(data.error || "Could not complete your signup. Please try again.");
  }
}

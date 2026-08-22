"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { Button, Card, Caption, Container, H2, Icon, Section, Text, TextInput, Textarea } from "../../ui";
import { Reveal } from "../../motion/reveal";
import { generalInquirySchema, type GeneralInquiryInput } from "../../../lib/contact-schema";

/**
 * GeneralInquiry — Contact page's third entry point, for anything that
 * doesn't fit the two funneled paths above it (`TwoPath`): partnerships,
 * media, vendor questions, etc. Deliberately its own `Card` with the
 * same visual language as `TwoPath`'s two cards (bordered, p-8, same
 * Caption/H2-ladder pattern) so it reads as a third option in the same
 * family, not a bolted-on generic form component.
 *
 * Submits to `POST /api/contact`, which sends a real email via Resend —
 * no client-side fake-success shortcut. `react-hook-form` + `zod` were
 * already project dependencies, unused until now; `generalInquirySchema`
 * (`app/lib/contact-schema.ts`) is the exact same schema the API route
 * re-validates server-side, so client and server never disagree about
 * what's a valid submission.
 */
export function GeneralInquiry() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GeneralInquiryInput>({
    resolver: zodResolver(generalInquirySchema),
  });

  async function onSubmit(values: GeneralInquiryInput) {
    setServerError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !body.ok) {
        setServerError(body.error ?? "Could not send your message. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
      reset();
    } catch {
      setServerError("Could not send your message. Check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <Section environment="light" className="border-t border-border">
      <Container size="lg" className="py-24 md:py-32">
        <Reveal>
          <Caption tone="accent">General Inquiry</Caption>
        </Reveal>
        <Reveal delay={0.05}>
          <H2 className="mt-4 max-w-xl">Not sure which path fits? Just ask.</H2>
        </Reveal>
        <Reveal delay={0.1}>
          <Text tone="secondary" size="lg" className="mt-4 max-w-xl">
            Partnerships, media, vendor questions, or anything else not covered above — send us a
            note and we&rsquo;ll route it to the right person.
          </Text>
        </Reveal>

        <Reveal delay={0.15}>
          <Card className="mt-10 max-w-xl p-8">
            {status === "success" ? (
              <div className="flex flex-col items-start gap-3 py-4" role="status" aria-live="polite">
                <Icon icon={CheckCircle2} size="lg" className="text-text-primary" />
                <Text tone="primary" className="font-medium">
                  Message sent — we&rsquo;ll get back to you soon.
                </Text>
                <Button variant="secondary" size="sm" onClick={() => setStatus("idle")}>
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
                <TextInput
                  label="Name"
                  required
                  autoComplete="name"
                  error={errors.name?.message}
                  {...register("name")}
                />
                <TextInput
                  label="Email"
                  type="email"
                  required
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register("email")}
                />
                <TextInput
                  label="Company (optional)"
                  autoComplete="organization"
                  error={errors.company?.message}
                  {...register("company")}
                />
                <Textarea
                  label="Message"
                  required
                  rows={5}
                  error={errors.message?.message}
                  {...register("message")}
                />

                {status === "error" && serverError && (
                  <p className="font-body text-sm text-risk-critical" role="alert">
                    {serverError}
                  </p>
                )}

                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-fit">
                  {isSubmitting ? "Sending…" : "Send Message"}
                </Button>
              </form>
            )}
          </Card>
        </Reveal>
      </Container>
    </Section>
  );
}

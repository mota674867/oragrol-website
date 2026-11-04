import { isVisible, savedValue, type Ctx } from "./engine.ts";
import type { Page as FormPage } from "./types.ts";

const asText = (v: unknown): string => (v === true ? "Yes" : Array.isArray(v)
  ? v.map((x) => (x && typeof x === "object" ? Object.values(x as Record<string, unknown>).filter((y) => y !== "").join(", ") : String(x))).join("; ")
  : String(v));

export interface CopySection { readonly title: string; readonly rows: readonly { readonly q: string; readonly a: string }[] }

/** The visible, answered questions grouped by page. Pure, so it can be tested without rendering. */
export function copySections(pages: readonly FormPage[], ctx: Ctx): CopySection[] {
  const out: CopySection[] = [];
  for (const page of pages) {
    const rows = page.fields.flatMap((f) => {
      if (!isVisible(f, ctx) || f.kind === "autodate" || f.kind === "check") return [];
      const v = savedValue(f, ctx);
      return v === undefined || v === "" ? [] : [{ q: f.label, a: asText(v) }];
    });
    if (rows.length) out.push({ title: page.title, rows });
  }
  return out;
}

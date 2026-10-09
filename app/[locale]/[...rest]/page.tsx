import { notFound } from "next/navigation";

// Any unmatched path under a locale renders the branded app/[locale]/not-found.tsx
// (with the shared header and footer) instead of Next.js's unbranded default 404.
export default function CatchAllNotFound() {
  notFound();
}

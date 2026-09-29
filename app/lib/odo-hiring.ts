// ORAGROL ODO — Hiring signal from the prospect's own careers page
//
// Section 33, Area 2: "Hiring signal is high-value and under-rated. What a
// company recruits for reveals what it lacks. A firm hiring its first IT
// person has no IT function. A firm hiring five administrators has a
// manual-process problem directly addressable by Business Automation."
//
// METHOD, per spec: fetch the prospect's own careers page and read
// schema.org JobPosting JSON-LD — free, zero third-party terms, ODO already
// fetches pages like this elsewhere (odo-page.ts's checkWellKnown).
//
// HONEST LIMITATION worth flagging, not hiding: the ICP for ODO (20-500
// employee Canadian SMBs, mostly WordPress/Wix/Squarespace) very rarely
// marks up job postings with schema.org JobPosting JSON-LD — that markup is
// far more common on larger corporate/ATS-backed career sites. So this check
// will land on not_determined for most prospects, honestly, rather than
// silently reporting "not hiring." To make the hiring signal actually useful
// for this ICP in practice, this module ALSO detects embedded third-party
// applicant-tracking-system (ATS) widgets (Greenhouse, Lever, BambooHR,
// Workable, Indeed) on the careers page — a much more common real-world
// signal for this segment than structured data, and itself informative
// (which ATS a company uses is a vendor-stack fact, same spirit as
// odo-page.ts's tech-stack fingerprint).

import { type Determination, observed, absent, notDetermined, fetchOrDetermine } from "./odo-evidence";
import { normalizeDomain } from "./odo-dns";

const CAREERS_PATHS = ["/careers", "/careers/", "/jobs", "/jobs/", "/about/careers", "/join-us", "/work-with-us", "/about-us/careers"];

const NO_OPENINGS_PATTERN = /no\s+(current\s+|open\s+)?(job\s+)?(openings|positions|vacancies|roles)\s+(at\s+this\s+time|available|currently)/i;

const ATS_PATTERNS: Array<[RegExp, string]> = [
  [/boards\.greenhouse\.io/i, "Greenhouse"],
  [/jobs\.lever\.co/i, "Lever"],
  [/\.bamboohr\.com\/(careers|jobs)/i, "BambooHR"],
  [/apply\.workable\.com/i, "Workable"],
  [/indeedapply\.com|indeed\.com\/hire/i, "Indeed"],
  [/jazz\.co|applytojob\.com/i, "JazzHR"],
  [/breezy\.hr/i, "Breezy HR"],
  [/recruitee\.com/i, "Recruitee"],
  [/smartrecruiters\.com/i, "SmartRecruiters"],
];

export type JobPosting = { title: string; datePosted: string | null };

export type HiringSignal = {
  careersPageUrl: string;
  jobPostings: JobPosting[];
  atsDetected: string | null;
};

function extractJobPostings(html: string): JobPosting[] {
  const postings: JobPosting[] = [];
  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(m[1].trim()) as unknown;
      const walk = (n: unknown) => {
        if (Array.isArray(n)) return n.forEach(walk);
        if (n && typeof n === "object") {
          const obj = n as Record<string, unknown>;
          const type = obj["@type"];
          const isJobPosting = type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"));
          if (isJobPosting && typeof obj.title === "string") {
            postings.push({ title: obj.title, datePosted: typeof obj.datePosted === "string" ? obj.datePosted : null });
          }
          // JobPosting can also appear nested inside a graph wrapper.
          if (Array.isArray(obj["@graph"])) walk(obj["@graph"]);
        }
      };
      walk(parsed);
    } catch {
      /* invalid JSON-LD is common; skip rather than fail the whole scan */
    }
  }
  return postings;
}

export async function checkHiringSignal(rawDomain: string): Promise<Determination<HiringSignal>> {
  const domain = normalizeDomain(rawDomain);
  const base = `https://${domain}`;

  const results = await Promise.all(CAREERS_PATHS.map((p) => fetchOrDetermine("careers:page", `${base}${p}`, { timeoutMs: 8000 })));
  const found = results.find((r) => r.state === "observed");

  if (!found || found.state !== "observed") {
    const anyDetermined = results.some((r) => r.state !== "not_determined");
    return anyDetermined
      ? absent<HiringSignal>("careers:page")
      : notDetermined<HiringSignal>("all common careers-page paths unreachable", "careers:page");
  }

  const idx = results.indexOf(found);
  const careersPageUrl = `${base}${CAREERS_PATHS[idx]}`;
  const html = found.value.body;

  const jobPostings = extractJobPostings(html);
  const atsMatch = ATS_PATTERNS.find(([re]) => re.test(html));

  if (jobPostings.length > 0 || atsMatch) {
    return observed({ careersPageUrl, jobPostings, atsDetected: atsMatch?.[1] ?? null }, "careers:page");
  }
  if (NO_OPENINGS_PATTERN.test(html)) {
    // The page explicitly states there are no open roles right now — a real,
    // if soft, absence rather than "we couldn't tell."
    return observed({ careersPageUrl, jobPostings: [], atsDetected: null }, "careers:page");
  }
  // Page exists but has neither structured JobPosting data, a known ATS
  // embed, nor an explicit no-openings statement. Plain-text job listings
  // (very common on small WordPress/Wix careers pages) are deliberately not
  // scraped here — too fragile, and guessing risks exactly the fabricated
  // "not hiring" read the evidence rules exist to prevent.
  return notDetermined<HiringSignal>(
    "careers page found but no structured hiring signal (no JobPosting markup, no ATS embed, no explicit no-openings statement)",
    "careers:page"
  );
}

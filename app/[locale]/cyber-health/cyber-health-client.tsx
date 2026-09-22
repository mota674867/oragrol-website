"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useMemo, useRef, useState } from "react";
import { categories, questions, sections, qualification } from "./assessment-data";
import SiteFooter from "@/app/components/site/footer";
import "@/app/gpt-pages.css";

/**
 * Bilingual (D-086, Task #21): rewired to consume the `CyberHealth`
 * namespace in messages/{en,fr}.json, sourced from
 * `ORAGROL_CyberHealth_FR_Translation.md`.
 *
 * **Index-pairing safety constraint, same pattern as OR ONE/Contact:**
 * `questions`, `sections`, `qualification` and `categories` (all
 * imported from `./assessment-data`) are NEVER touched -- their `id`
 * values are matched by exact string identity throughout this
 * component's scoring logic (`answers[q.id]`, `q.id.startsWith(...)`,
 * the `Q08-*-GWS` regex swap) and `categories` feeds the score
 * calculation only, never rendered on screen. Translated question/
 * section/qualification text lives in `CyberHealth.assessment.*` /
 * `CyberHealth.qualify.*` instead, resolved purely by array position
 * -- a `Map` from question id to its fixed index in `assessment-data.ts`'s
 * `questions` array (`QUESTION_INDEX` below) is what makes that safe:
 * the display text always follows the *data* by id, never by render
 * order, so a future reordering of `visibleQuestions` can't desync
 * text from id.
 *
 * **`categories`' 20 names are intentionally left untranslated** --
 * grepped confirmed `categoryScores` (built from `categories`) only
 * ever feeds the numeric `score` calculation, never rendered in this
 * component's JSX. They only surface inside the PDF report generator
 * (`pdf-report.tsx` / `report-data.ts`), which is explicitly out of
 * scope for this pass -- see the translation doc's own "Known gaps"
 * section: the PDF's actual findings/recommendations text isn't
 * visible anywhere in the on-screen quiz flow and needs its own,
 * separate translation pass once its content can actually be read.
 *
 * **Q08 generic (non-GWS) pair — a real doc/live-code mismatch, same
 * class of catch as FAQ's Phase 2f fix:** the translation doc's
 * "Microsoft 365 variant" of Q08-1/Q08-2 doesn't exist in the live
 * code. The live code has only two Q08 variants: `-GWS` (shown when
 * Cloud Platform = Google Workspace, translated straight from the
 * doc, which matches word for word) and a generic pair (shown for
 * Microsoft 365 / Neither / Not Sure alike, asking about "whatever
 * cloud email/file system you use"). The doc's author flagged this
 * exact uncertainty inline ("captured from memory ... not
 * re-verified") -- the live code confirms there never was a
 * Microsoft-365-specific variant, so the generic pair was freshly
 * translated against the actual live EN text instead of the doc's
 * misremembered one.
 *
 * **Result-stage tier badge and headline for Medium/High** — the
 * translation doc only confirmed Low and Critical live (it ran the
 * quiz twice, all-Yes and all-No); Medium/High weren't covered
 * because a partial-answer run wasn't done. Reading the live
 * component source directly (line with the score ternary) surfaced
 * all four headlines with no need to re-run the quiz -- "live code is
 * source of truth" resolves the doc's own flagged gap for free.
 * Medium/High French headlines below are this session's own
 * translation (not from the doc), flagged here for Mohammad's
 * awareness same as the doc flagged its own gaps.
 *
 * **No language switcher added** -- unlike every other page this
 * session, this component's header was already minimal by design (just
 * the wordmark + a stage label, no nav, no existing switcher button of
 * any kind to fix) across all 5 stages. That's the quiz funnel's
 * existing UX pattern, not a gap -- left as-is rather than adding new
 * chrome that wasn't there in English either.
 */

type Answer = "Yes" | "No" | "Not Sure";
type Stage = "intro" | "profile" | "qualify" | "assessment" | "result";
type Profile = {
  company: string;
  industry: string;
  province: string;
  employees: string;
  platform: string;
  name: string;
  email: string;
  phone: string;
};
const industries = ["Retail", "Professional Services", "Healthcare", "Construction", "Manufacturing", "Hospitality", "Non-Profit", "Other"];
const provinces = ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon", "Other"];

// id -> fixed index in assessment-data.ts's `questions` array, so
// display text always resolves by id, never by render order.
const QUESTION_INDEX = new Map(questions.map((q, i) => [q.id, i]));

type ReportStatus = "idle" | "sending" | "sent" | "error";

function CyberHealthClient() {
  const t = useTranslations("CyberHealth");
  const [stage, setStage] = useState<Stage>("intro"),
    [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({}),
    [qual, setQual] = useState<Record<string, string>>({});
  const [profile, setProfile] = useState<Profile>({ company: "", industry: "", province: "", employees: "", platform: "", name: "", email: "", phone: "" });
  const [reportStatus, setReportStatus] = useState<ReportStatus>("idle");
  const [reportError, setReportError] = useState<string | null>(null);
  const lastSentPayload = useRef<string | null>(null);
  const visibleQuestions = useMemo(() => questions.filter((q) => (profile.platform === "Google Workspace" ? !q.id.match(/^Q08-[12]$/) : !q.id.includes("-GWS"))), [profile.platform]);
  const sectionQuestions = visibleQuestions.filter((q) => q.section === sections[step]);
  const sectionComplete = sectionQuestions.every((q) => answers[q.id]);
  const profileComplete = Object.values(profile).every(Boolean) && /^\S+@\S+\.\S+$/.test(profile.email);
  const qualComplete = qualification.every((q) => qual[q.id]);
  const categoryScores = useMemo(
    () =>
      categories.map((c) => {
        const qs = visibleQuestions.filter((q) => q.id.startsWith(`Q${c.id}-`));
        const earned = qs.reduce((n, q) => n + (answers[q.id] === "Yes" ? 2 : answers[q.id] === "Not Sure" ? 1 : 0), 0);
        return { ...c, score: qs.length ? (earned / (2 * qs.length)) * 100 : 0 };
      }),
    [answers, visibleQuestions],
  );
  const score = useMemo(() => Math.round(categoryScores.reduce((n, c) => n + c.score * c.weight, 0) / 38), [categoryScores]);
  const tier = score >= 80 ? "Low" : score >= 60 ? "Medium" : score >= 40 ? "High" : "Critical";
  const answered = visibleQuestions.filter((q) => answers[q.id]).length;
  const go = (s: Stage) => {
    setStage(s);
    scrollTo(0, 0);
  };
  const header = (label: string) => (
    <header>
      <Link href="/">
        {t("header.wordmark")} <small>{t("header.wordmarkSmall")}</small>
      </Link>
      <b>{label}</b>
    </header>
  );
  const submitReport = async () => {
    const payload = JSON.stringify({ profile, qualification: qual, answers });
    if (reportStatus === "sent" && lastSentPayload.current === payload) return;
    setReportStatus("sending");
    setReportError(null);
    try {
      const res = await fetch("/api/cyber-health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });
      const data: { ok: boolean; error?: string } = await res.json();
      if (!res.ok || !data.ok) {
        setReportStatus("error");
        setReportError(data.error || t("result.reportErrorGeneric"));
        return;
      }
      setReportStatus("sent");
      lastSentPayload.current = payload;
    } catch {
      setReportStatus("error");
      setReportError(t("result.reportErrorNetwork"));
    }
  };

  const industryOptions = t.raw("profile.industries") as string[];
  const provinceOptions = t.raw("profile.provinces") as string[];
  const employeeOptions = t.raw("profile.employeeRanges") as string[];
  const platformOptions = t.raw("profile.platformOptions") as string[];
  const answerOptions = t.raw("assessment.answerOptions") as string[];

  if (stage === "intro")
    return (
      <main className="nch intro">
        {header(t("header.introLabel"))}
        <section>
          <span className="nch-or">OR</span>
          <p>{t("intro.meta")}</p>
          <h1>
            {t("intro.title1")}
            <br />
            <i>{t("intro.titleEmphasis")}</i>
          </h1>
          <p>{t("intro.body")}</p>
          <button onClick={() => go("profile")}>{t("intro.cta")}</button>
        </section>
        <SiteFooter />
      </main>
    );

  if (stage === "profile") {
    const fieldDefs: [keyof Profile, string, string, string[] | null][] = [
      ["company", t("profile.fields.company"), "text", null],
      ["industry", t("profile.fields.industry"), "select", industryOptions],
      ["province", t("profile.fields.province"), "select", provinceOptions],
      ["employees", t("profile.fields.employees"), "select", employeeOptions],
      ["platform", t("profile.fields.platform"), "select", platformOptions],
      ["name", t("profile.fields.name"), "text", null],
      ["email", t("profile.fields.email"), "email", null],
      ["phone", t("profile.fields.phone"), "tel", null],
    ];
    const canonicalOptions: Record<string, string[]> = {
      industry: industries,
      province: provinces,
      employees: ["1-10", "11-25", "26-50", "51-100", "101-200"],
      platform: ["Microsoft 365", "Google Workspace", "Neither", "Not Sure"],
    };
    return (
      <main className="nch formstage">
        {header(t("header.profileLabel"))}
        <section>
          <aside>
            <p>{t("profile.eyebrow")}</p>
            <h1>{t("profile.title")}</h1>
            <p>{t("profile.sub")}</p>
          </aside>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (profileComplete) go("qualify");
            }}
          >
            {fieldDefs.map(([key, label, type, translatedOptions]) => (
              <label key={key}>
                <span>{label}</span>
                {type === "select" && translatedOptions ? (
                  <select required value={profile[key]} onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}>
                    <option value="">{t("profile.selectPlaceholder")}</option>
                    {canonicalOptions[key].map((canonicalValue, i) => (
                      <option key={canonicalValue} value={canonicalValue}>
                        {translatedOptions[i]}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input required minLength={key === "name" ? 3 : undefined} type={type} value={profile[key]} onChange={(e) => setProfile({ ...profile, [key]: e.target.value })} />
                )}
              </label>
            ))}
            <footer>
              <button type="button" onClick={() => go("intro")}>
                {t("profile.back")}
              </button>
              <button disabled={!profileComplete}>{t("profile.continue")}</button>
            </footer>
            <small>{t("profile.disclaimer")}</small>
          </form>
        </section>
      </main>
    );
  }

  if (stage === "qualify")
    return (
      <main className="nch formstage">
        {header(t("header.qualifyLabel"))}
        <section>
          <aside>
            <p>{t("qualify.eyebrow")}</p>
            <h1>{t("qualify.title")}</h1>
            <p>{t("qualify.sub")}</p>
          </aside>
          <div className="nch-q compact">
            {qualification.map((q, qi) => {
              const choicesTranslated = t.raw(`qualify.questions.${qi}.choices`) as string[];
              return (
                <fieldset key={q.id}>
                  <legend>
                    <small>0{qi + 1}</small>
                    {t(`qualify.questions.${qi}.label`)}
                  </legend>
                  <div>
                    {q.choices.map((v, i) => (
                      <label className={qual[q.id] === v ? "chosen" : ""} key={v}>
                        <input type="radio" name={q.id} onChange={() => setQual({ ...qual, [q.id]: v })} />
                        <b>{String.fromCharCode(65 + i)}</b>
                        {choicesTranslated[i]}
                      </label>
                    ))}
                  </div>
                </fieldset>
              );
            })}
            <footer>
              <button onClick={() => go("profile")}>{t("qualify.back")}</button>
              <button disabled={!qualComplete} onClick={() => go("assessment")}>
                {t("qualify.startQuestions")}
              </button>
            </footer>
          </div>
        </section>
      </main>
    );

  if (stage === "result") {
    const tierHeadline = t(`result.tierHeadlines.${tier}`);
    const tierName = t(`result.tierNames.${tier}`);
    return (
      <main className="nch result">
        {header(t("header.resultLabel"))}
        <section>
          <div>
            <p>{t("result.scoreLabel")}</p>
            <strong>{score}</strong>
            <span>/100</span>
            <dl>
              <div>
                <dt>{t("result.riskTierLabel")}</dt>
                <dd>{tierName}</dd>
              </div>
              <div>
                <dt>{t("result.nextStepLabel")}</dt>
                <dd>{t("result.nextStepValue")}</dd>
              </div>
            </dl>
          </div>
          <article>
            <p className="eyebrow">{profile.company || t("result.businessFallback")}</p>
            <h1>{tierHeadline}</h1>
            <p>{t("result.disclaimer")}</p>
            <button
              onClick={() => {
                setStep(0);
                go("assessment");
              }}
            >
              {t("result.reviewAnswers")}
            </button>
            {reportStatus !== "idle" && (
              <p className="ch-report-status" data-status={reportStatus} role="status">
                {reportStatus === "sending" ? t("result.reportSending", { email: profile.email }) : reportStatus === "sent" ? t("result.reportSent", { email: profile.email }) : reportError}
              </p>
            )}
          </article>
        </section>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="nch assess">
      <header>
        <Link href="/">
          {t("header.wordmark")} <small>{t("header.wordmarkSmall")}</small>
        </Link>
        <div>
          <b>
            {answered} / {visibleQuestions.length}
          </b>
          <i style={{ width: `${(answered / visibleQuestions.length) * 100}%` }} />
        </div>
      </header>
      <section>
        <aside>
          <p>
            {String(step + 1).padStart(2, "0")} / {String(sections.length).padStart(2, "0")}
          </p>
          <h1>{t(`assessment.sections.${step}`)}</h1>
          <p>{t("assessment.sectionIntro")}</p>
          <nav>
            {sections.map((s, i) => (
              <span className={i === step ? "on" : i < step ? "done" : ""} key={s}>
                {String(i + 1).padStart(2, "0")} {t(`assessment.sections.${i}`)}
              </span>
            ))}
          </nav>
        </aside>
        <div className="nch-q">
          {sectionQuestions.map((q) => {
            const qIndex = QUESTION_INDEX.get(q.id)!;
            return (
              <fieldset key={q.id}>
                <legend>
                  <small>{q.id.replace("-GWS", "")}</small>
                  {t(`assessment.questions.${qIndex}.text`)}
                </legend>
                <div>
                  {(["Yes", "No", "Not Sure"] as Answer[]).map((v, i) => (
                    <label className={answers[q.id] === v ? "chosen" : ""} key={v}>
                      <input type="radio" name={q.id} checked={answers[q.id] === v} onChange={() => setAnswers({ ...answers, [q.id]: v })} />
                      <b>{String.fromCharCode(65 + i)}</b>
                      {answerOptions[i]}
                    </label>
                  ))}
                </div>
              </fieldset>
            );
          })}
          <footer>
            <button onClick={() => (step ? setStep(step - 1) : go("qualify"))}>{t("assessment.back")}</button>
            {step < sections.length - 1 ? (
              <button
                disabled={!sectionComplete}
                onClick={() => {
                  setStep(step + 1);
                  scrollTo(0, 0);
                }}
              >
                {t("assessment.nextSection")}
              </button>
            ) : (
              <button
                disabled={!sectionComplete}
                onClick={() => {
                  go("result");
                  submitReport();
                }}
              >
                {t("assessment.calculateScore")}
              </button>
            )}
          </footer>
        </div>
      </section>
    </main>
  );
}

export default CyberHealthClient;

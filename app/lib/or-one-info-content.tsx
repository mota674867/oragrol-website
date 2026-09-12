import type { ReactNode } from "react";

export type OrOneInfoItem = { id: string; title: string; content: ReactNode; plainText: string };

const choosePara = (
  <p className="mb-3">
    <strong>Choose what you actually need.</strong> Pick and combine capabilities from any of the 10
    categories, mix and match to fit exactly what your business needs automated, not a fixed bundle someone
    else decided for you. If you&apos;re not sure which combination makes the most sense, reach out and
    we&apos;ll help you find the right fit before you commit to anything.
  </p>
);

const differentBlock = (
  <>
    <p className="mb-2 font-semibold">What makes this different from a rented tool:</p>
    <p className="mb-1">1. Your own live dashboard, one login, everything your AI workforce is doing, visible in real time</p>
    <p className="mb-1">2. You decide what&apos;s approved, directly in the dashboard, no email chains</p>
    <p className="mb-1">3. Real configuration rights, request changes within your point budget as your business evolves</p>
    <p className="mb-1">4. Built once, exclusively for you, never resold or reused as a template for another client</p>
    <p className="mb-3">
      5. Nothing pre-existing required, we provide and manage everything underneath, you never touch or
      manage the tools yourself
    </p>
  </>
);

export const orOneInfoItems: Record<string, OrOneInfoItem> = {
  STARTER: {
    id: "starter",
    title: "STARTER",
    content: (
      <>
        <p className="mb-3">
          A fully custom AI workforce, built and hosted entirely by us, covering up to 30 points of
          capability across any combination of Sales, Marketing, Finance, HR, Customer Service, Operations,
          IT, Procurement, Legal, and Leadership.
        </p>
        <p className="mb-3">
          <strong>How points work:</strong> Every capability across all 10 departments has a fixed point
          value. 30 points covers a focused slice of one department, enough to automate the specific tasks
          eating the most time, not the whole function yet.
        </p>
        {choosePara}
        {differentBlock}
        <p className="mb-3">
          <strong>Pricing:</strong> $22,000 build, $999/month.
        </p>
        <p className="mb-3">
          <strong>Suitable for:</strong> A very small business, typically 1 to 3 staff, wanting to automate a
          specific, focused piece of one core function before going further.
        </p>
        <p>
          <strong>The real value:</strong> Year one costs under $34,000, less than the cost of one part-time
          hire, and this one runs 24/7, every day of the year. From year two onward, only the $999 monthly
          fee remains.
        </p>
      </>
    ),
    plainText:
      "OR ONE STARTER: a fully custom AI workforce covering up to 30 points across any combination of 10 departments. $22,000 build, $999/month. Suitable for a very small business, 1 to 3 staff, automating a focused piece of one core function. Year one costs under $34,000.",
  },
  "100": {
    id: "or-one-100",
    title: "100",
    content: (
      <>
        <p className="mb-3">
          A fully custom AI workforce, built and hosted entirely by us, covering up to 100 points of
          capability across any combination of Sales, Marketing, Finance, HR, Customer Service, Operations,
          IT, Procurement, Legal, and Leadership, whichever your business actually needs.
        </p>
        <p className="mb-3">
          <strong>How points work:</strong> 100 points is enough to fully cover one real department, Sales
          (64 points), Customer Service (48 points), or IT (48 points), for example, with real room left
          over to add a meaningful slice of a second department on the same system, same price.
        </p>
        {choosePara}
        {differentBlock}
        <p className="mb-3">
          <strong>Example:</strong> A business chooses full Sales coverage, all 9 capabilities, 64 points.
          The remaining 36 points cover Answering inquiries, Support ticket tracking, and After-sales
          follow-up from Customer Service, a real second department, running on the same system, same login,
          same price.
        </p>
        <p className="mb-3">
          <strong>Pricing:</strong> $75,000 build, $3,999/month.
        </p>
        <p className="mb-3">
          <strong>Suitable for:</strong> A small business, typically 3 to 6 staff, ready to fully automate
          one or two core functions of their operation.
        </p>
        <p>
          <strong>The real value:</strong> Year one costs under $123,000, close to what two full-time staff
          would cost you in salary alone. From year two onward, only the $3,999 monthly fee remains.
        </p>
      </>
    ),
    plainText:
      "OR ONE 100: covers up to 100 points, enough to fully cover one department like Sales (64 points) with room for a second. $75,000 build, $3,999/month. Suitable for a small business, 3 to 6 staff. Year one costs under $123,000, close to two full-time staff salaries.",
  },
  "200": {
    id: "or-one-200",
    title: "200",
    content: (
      <>
        <p className="mb-3">
          A fully custom AI workforce, built and hosted entirely by us, covering up to 200 points of
          capability across any combination of Sales, Marketing, Finance, HR, Customer Service, Operations,
          IT, Procurement, Legal, and Leadership.
        </p>
        <p className="mb-3">
          <strong>How points work:</strong> 200 points fully covers two or three real departments together,
          sharing the same data and the same system, working as one coordinated operation instead of
          separate disconnected tools.
        </p>
        {choosePara}
        {differentBlock}
        <p className="mb-3">
          <strong>Example:</strong> A business runs full Sales (64 points) and full Marketing (79 points)
          together, 143 points, sharing one pipeline of leads and campaigns. The remaining 57 points add real
          coverage in Customer Service, one connected system across three departments.
        </p>
        <p className="mb-3">
          <strong>Pricing:</strong> $150,000 build, $5,999/month.
        </p>
        <p className="mb-3">
          <strong>Suitable for:</strong> A growing business, typically 6 to 15 staff, ready to run several
          departments as one coordinated system instead of managing them separately.
        </p>
        <p>
          <strong>The real value:</strong> Year one costs under $222,000, roughly what three to four staff
          would cost in salary and benefits combined. From year two onward, only the $5,999 monthly fee
          remains.
        </p>
      </>
    ),
    plainText:
      "OR ONE 200: covers up to 200 points, fully covering two or three departments together as one coordinated system. $150,000 build, $5,999/month. Suitable for a growing business, 6 to 15 staff. Year one costs under $222,000.",
  },
  "400": {
    id: "or-one-400",
    title: "400",
    content: (
      <>
        <p className="mb-3">
          A fully custom AI workforce, built and hosted entirely by us, covering up to 400 points of
          capability, enough to run nearly your entire business across all 10 departments as one system.
        </p>
        <p className="mb-3">
          <strong>How points work:</strong> 400 points covers the large majority of everything across Sales,
          Marketing, Finance, HR, Customer Service, Operations, IT, Procurement, Legal, and Leadership, real,
          comprehensive coverage, not a handful of departments.
        </p>
        {choosePara}
        {differentBlock}
        <p className="mb-3">
          <strong>Example:</strong> A business runs Sales, Marketing, Finance, and Customer Service fully
          covered, 281 points, with the remaining 119 points spread across HR, Operations, and IT, a real,
          connected operation running across seven departments as one system.
        </p>
        <p className="mb-3">
          <strong>Pricing:</strong> $220,000 build, $8,999/month.
        </p>
        <p className="mb-3">
          <strong>Suitable for:</strong> An established business, typically 15 to 40+ staff, ready to run the
          large majority of their operation as one coordinated AI workforce.
        </p>
        <p>
          <strong>The real value:</strong> Year one costs under $328,000, well under what 5 to 6 full-time
          staff across multiple departments would cost in salary and benefits combined, and this one never
          takes a day off. From year two onward, only the $8,999 monthly fee remains.
        </p>
      </>
    ),
    plainText:
      "OR ONE 400: covers up to 400 points, running nearly the entire business across all 10 departments as one system. $220,000 build, $8,999/month. Suitable for an established business, 15 to 40+ staff. Year one costs under $328,000.",
  },
};

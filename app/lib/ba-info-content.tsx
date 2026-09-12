import type { ReactNode } from "react";

/**
 * BA info-icon content — 6 items, "modal" variant.
 * Content transcribed exactly from BA_Complete_Content.md (locked). Do
 * not paraphrase here; if the source copy changes, update it there and
 * re-transcribe, so this file and the approved copy never drift apart.
 */

export type BaInfoItem = {
  id: string;
  title: string;
  content: ReactNode;
  plainText: string;
};

function ItemsTable({ left, right }: { left: string[]; right: string[] }) {
  const rows = Math.max(left.length, right.length);
  return (
    <table className="mb-3">
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <tr key={i}>
            <td className="py-0.5 pr-3">{left[i] ?? ""}</td>
            <td className="py-0.5">{right[i] ?? ""}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export const baInfoItems: BaInfoItem[] = [
  {
    id: "ba-finance",
    title: "Finance",
    content: (
      <>
        <p className="mb-3">
          Finance connects to your existing accounting software and bank feed and keeps your business&apos;s
          financial picture current, every single day.
        </p>
        <p className="mb-2 font-semibold">This service will deliver the following to you:</p>
        <ItemsTable
          left={[
            "1. Issues and sends invoices",
            "2. Collects client payments",
            "3. Monitors cash flow",
            "4. Tracks and records all expenses",
            "5. Records every payment received and paid",
            "6. Manages subscriptions",
          ]}
          right={[
            "7. Tracks loan payments",
            "8. Prepares payroll for your approval",
            "9. Prepares accounts payable for your approval",
            "10. Flags tax deadlines",
            "11. Adds the correct tax to invoices",
            "12. Prepares simple financial reports",
          ]}
        />
        <p className="mb-3">
          <sub>
            All ORAGROL services include a human checkpoint for final approval on sensitive actions. No
            service runs fully unsupervised.
          </sub>
        </p>
        <p className="mb-3">
          <strong>AI Agent:</strong> Continuously reconciles your financial data, prepares payroll and
          payables for your approval, flags cash issues and tax deadlines before they become problems, and
          turns raw numbers into a plain-language view of where your business stands.
        </p>
        <p className="mb-3">
          <strong>Scale:</strong> Does the daily work of a full-time bookkeeper or accounting coordinator,
          without business hours, sick days, vacation, or turnover.
        </p>
        <p className="mb-3">
          <strong>Example:</strong> With BA Finance, a retail business owner used to find out about a cash
          shortfall when a payment bounced. Now the same gap gets flagged three weeks earlier, while
          there&apos;s still time to act.
        </p>
        <p className="mb-3">
          <strong>
            Anything above that needs your sign off gets emailed to you directly, one click to approve, one
            click to reject. No login, no new system.
          </strong>
        </p>
        <p>
          <strong>Who it&apos;s for:</strong> Owners who want one finance operation handling invoicing,
          collections, expenses, cash flow, and payroll and tax prep, without hiring a full internal finance
          team.
        </p>
      </>
    ),
    plainText:
      "Finance connects to your existing accounting software and bank feed and keeps your business's financial picture current every day: issues and sends invoices, collects client payments, monitors cash flow, tracks and records all expenses, records every payment received and paid, manages subscriptions, tracks loan payments, prepares payroll and accounts payable for your approval, flags tax deadlines, adds the correct tax to invoices, and prepares simple financial reports. Anything needing your sign off gets emailed to you directly with one click to approve or reject. Does the daily work of a full-time bookkeeper or accounting coordinator. Who it's for: owners who want one finance operation handling invoicing, collections, expenses, cash flow, and payroll and tax prep without hiring a full internal finance team.",
  },
  {
    id: "ba-sales",
    title: "Sales",
    content: (
      <>
        <p className="mb-3">
          Sales connects to your CRM and inbox and keeps your entire sales pipeline moving every day,
          automatically.
        </p>
        <p className="mb-2 font-semibold">This service will deliver the following to you:</p>
        <ItemsTable
          left={[
            "1. Qualifies and scores every incoming lead",
            "2. Keeps your CRM updated automatically",
            "3. Drafts quotes and proposals",
            "4. Follows up with existing clients on schedule",
          ]}
          right={[
            "5. Generates upsell and cross-sell offers",
            "6. Forecasts sales and builds reports",
            "7. Tracks and prompts referral requests",
          ]}
        />
        <p className="mb-3">
          <sub>
            All ORAGROL services include a human checkpoint for final approval on sensitive actions. No
            service runs fully unsupervised.
          </sub>
        </p>
        <p className="mb-3">
          <strong>AI Agent:</strong> Works your pipeline daily, scores every lead the moment it arrives, and
          drafts quotes the instant a deal is ready to close.
        </p>
        <p className="mb-3">
          <strong>Scale:</strong> Does the daily work of a full-time sales coordinator, without business
          hours, sick days, or turnover.
        </p>
        <p className="mb-3">
          <strong>Example:</strong> With BA Sales, a lead comes in at 11pm. By morning it&apos;s scored,
          added to your CRM, and a personalized follow-up is already scheduled, no one on your team touched
          it.
        </p>
        <p className="mb-3">
          <strong>
            Anything above that needs your sign off gets emailed to you directly, one click to approve, one
            click to reject. No login, no new system.
          </strong>
        </p>
        <p>
          <strong>Who it&apos;s for:</strong> Owners tired of leads going cold because follow-up depends on
          someone remembering to do it.
        </p>
      </>
    ),
    plainText:
      "Sales connects to your CRM and inbox and keeps your entire sales pipeline moving every day: qualifies and scores every incoming lead, keeps your CRM updated automatically, drafts quotes and proposals, follows up with existing clients on schedule, generates upsell and cross-sell offers, forecasts sales and builds reports, and tracks and prompts referral requests. Anything needing your sign off gets emailed to you directly with one click to approve or reject. Does the daily work of a full-time sales coordinator. Who it's for: owners tired of leads going cold because follow-up depends on someone remembering to do it.",
  },
  {
    id: "ba-customer-service",
    title: "Customer Service",
    content: (
      <>
        <p className="mb-3">
          Customer Service runs inside your existing helpdesk or inbox and keeps every customer conversation
          moving, day and night.
        </p>
        <p className="mb-2 font-semibold">This service will deliver the following to you:</p>
        <ItemsTable
          left={[
            "1. Answers inquiries across phone, email, and chat",
            "2. Triages and handles complaints",
            "3. Resolves order and service issues",
            "4. Keeps your FAQ and knowledge base current",
          ]}
          right={[
            "5. Sends satisfaction surveys",
            "6. Tracks every support ticket",
            "7. Follows up after every sale",
            "8. Prepares returns and refunds for your approval",
          ]}
        />
        <p className="mb-3">
          <sub>
            All ORAGROL services include a human checkpoint for final approval on sensitive actions. No
            service runs fully unsupervised.
          </sub>
        </p>
        <p className="mb-3">
          <strong>AI Agent:</strong> Answers routine questions instantly, sorts complaints by urgency, and
          keeps every ticket moving so nothing sits unanswered.
        </p>
        <p className="mb-3">
          <strong>Scale:</strong> Does the daily work of a full-time support agent, answering instantly at
          3am the same way it does at 3pm.
        </p>
        <p className="mb-3">
          <strong>Example:</strong> With BA Customer Service, a customer emails at midnight asking about a
          late order. They get a real answer in minutes, not a next-business-day reply.
        </p>
        <p className="mb-3">
          <strong>
            Returns and refunds get emailed to you directly, one click to approve, one click to reject. No
            login, no new system.
          </strong>
        </p>
        <p>
          <strong>Who it&apos;s for:</strong> Owners whose support inbox is the first thing that falls
          behind when the business gets busy.
        </p>
      </>
    ),
    plainText:
      "Customer Service runs inside your existing helpdesk or inbox: answers inquiries across phone, email, and chat, triages and handles complaints, resolves order and service issues, keeps your FAQ and knowledge base current, sends satisfaction surveys, tracks every support ticket, follows up after every sale, and prepares returns and refunds for your approval. Returns and refunds get emailed to you directly with one click to approve or reject. Does the daily work of a full-time support agent, answering instantly around the clock. Who it's for: owners whose support inbox is the first thing that falls behind when the business gets busy.",
  },
  {
    id: "ba-marketing",
    title: "Marketing",
    content: (
      <>
        <p className="mb-3">
          Marketing runs your content, social, email, and ad campaigns directly on your own accounts, every
          day, without you managing any of it by hand.
        </p>
        <p className="mb-2 font-semibold">This service will deliver the following to you:</p>
        <ItemsTable
          left={[
            "1. Manages routine website updates",
            "2. Handles SEO and ongoing ranking improvement",
            "3. Writes blog posts and articles in your brand voice",
            "4. Schedules and posts to your social channels",
            "5. Runs email campaigns and newsletters",
          ]}
          right={[
            "6. Manages paid ad campaigns inside your set budget",
            "7. Produces routine graphic design",
            "8. Researches your market and competitors",
            "9. Reports on marketing performance",
            "10. Runs lead generation campaigns",
          ]}
        />
        <p className="mb-3">
          <sub>
            All ORAGROL services include a human checkpoint for final approval on sensitive actions. No
            service runs fully unsupervised.
          </sub>
        </p>
        <p className="mb-3">
          <strong>AI Agent:</strong> Plans and runs your content calendar, keeps ad spend inside budget, and
          reports weekly on what&apos;s actually working.
        </p>
        <p className="mb-3">
          <strong>Scale:</strong> Does the daily work of a full-time marketing coordinator, running
          campaigns around the clock, every day of the year.
        </p>
        <p className="mb-3">
          <strong>Example:</strong> With BA Marketing, a competitor drops their prices. The research feeds
          it straight into that week&apos;s content and ad messaging, same day, not next month&apos;s
          meeting.
        </p>
        <p className="mb-3">
          <strong>
            Ad spend beyond your set budget, or anything before it goes live publicly, gets emailed to you
            directly, one click to approve, one click to reject. No login, no new system.
          </strong>
        </p>
        <p>
          <strong>Who it&apos;s for:</strong> Owners who know marketing matters but don&apos;t have hours a
          week to run it themselves.
        </p>
      </>
    ),
    plainText:
      "Marketing runs your content, social, email, and ad campaigns directly on your own accounts: manages routine website updates, handles SEO and ongoing ranking improvement, writes blog posts and articles in your brand voice, schedules and posts to your social channels, runs email campaigns and newsletters, manages paid ad campaigns inside your set budget, produces routine graphic design, researches your market and competitors, reports on marketing performance, and runs lead generation campaigns. Ad spend beyond your set budget gets emailed to you directly with one click to approve or reject. Does the daily work of a full-time marketing coordinator. Who it's for: owners who know marketing matters but don't have hours a week to run it themselves.",
  },
  {
    id: "ba-it",
    title: "IT",
    content: (
      <>
        <p className="mb-3">
          IT watches your systems around the clock and keeps the routine technical work of running a
          business handled quietly in the background.
        </p>
        <p className="mb-2 font-semibold">This service will deliver the following to you:</p>
        <ItemsTable
          left={[
            "1. Applies software maintenance and patches",
            "2. Manages software licenses",
            "3. Handles helpdesk requests, passwords, and access",
            "4. Runs and verifies data backups",
          ]}
          right={[
            "5. Monitors basic cyber hygiene",
            "6. Maintains your website and hosting",
            "7. Connects your software tools together",
          ]}
        />
        <p className="mb-3">
          <sub>
            All ORAGROL services include a human checkpoint for final approval on sensitive actions. No
            service runs fully unsupervised.
          </sub>
        </p>
        <p className="mb-3">
          <strong>AI Agent:</strong> Watches your systems around the clock, applies routine patches
          automatically, and flags anything that needs a real decision.
        </p>
        <p className="mb-3">
          <strong>Scale:</strong> Does the daily work of a part-time IT technician, watching every system
          continuously, not just during office hours.
        </p>
        <p className="mb-3">
          <strong>Example:</strong> With BA IT, a critical security patch is released overnight. It&apos;s
          tested and applied before your team even opens their laptop.
        </p>
        <p className="mb-3">
          <strong>
            Any change affecting a critical system gets emailed to you directly, one click to approve, one
            click to reject. No login, no new system.
          </strong>
        </p>
        <p>
          <strong>Who it&apos;s for:</strong> Owners without a dedicated IT person, tired of small tech
          problems turning into big ones.
        </p>
      </>
    ),
    plainText:
      "IT watches your systems around the clock: applies software maintenance and patches, manages software licenses, handles helpdesk requests, passwords, and access, runs and verifies data backups, monitors basic cyber hygiene, maintains your website and hosting, and connects your software tools together. Any change affecting a critical system gets emailed to you directly with one click to approve or reject. Does the daily work of a part-time IT technician, watching every system continuously. Who it's for: owners without a dedicated IT person, tired of small tech problems turning into big ones.",
  },
  {
    id: "ba-tailored-automation",
    title: "Tailored Automation",
    content: (
      <>
        <p className="mb-3">
          Not every business need fits neatly into Finance, Sales, Customer Service, Marketing, or IT.
          Tailored Automation is where anything outside those 5 packages goes, whatever repetitive,
          time-consuming work is unique to how your business actually runs, we review it and build an
          automation specifically for that.
        </p>
        <p className="mb-2 font-semibold">How it works:</p>
        <ItemsTable
          left={[
            "1. You describe the task or process you want automated",
            "2. We review it and confirm whether it's genuinely automatable",
            "3. We scope exactly what it will and won't do",
          ]}
          right={[
            "4. We build and test it against your real workflow",
            "5. It runs the same way as your other BA items, with the same approval discipline",
            "6. Priced based on real scope, not a fixed package rate",
          ]}
        />
        <p className="mb-3">
          <sub>
            All ORAGROL services include a human checkpoint for final approval on sensitive actions. No
            service runs fully unsupervised.
          </sub>
        </p>
        <p className="mb-3">
          <strong>AI Agent:</strong> Built specifically around the one task you describe, nothing generic,
          nothing borrowed from another package.
        </p>
        <p className="mb-3">
          <strong>Example:</strong> A property management company needed something none of the 5 packages
          covered, matching maintenance requests to the right contractor automatically based on job type and
          availability. Tailored Automation built exactly that, and only that.
        </p>
        <p className="mb-3">
          <strong>
            Anything above that needs your sign off gets emailed to you directly, one click to approve, one
            click to reject. No login, no new system.
          </strong>
        </p>
        <p className="mb-3">
          <strong>Who it&apos;s for:</strong> Owners with a specific, repetitive business problem that
          doesn&apos;t fit a standard package, but is genuinely worth automating on its own.
        </p>
        <p>
          <strong>Pricing:</strong> No fixed package rate, real custom quote per request, scoped after we
          see exactly what&apos;s being asked for. If a request turns out to be bigger than a single bounded
          task, we&apos;ll say so honestly, that may be an OR ONE conversation instead.
        </p>
      </>
    ),
    plainText:
      "Tailored Automation covers business needs outside the 5 standard BA packages: you describe the task, we review whether it's genuinely automatable, scope exactly what it will and won't do, build and test it against your real workflow, and run it with the same approval discipline as every other BA item. Priced with a real custom quote per request, not a fixed package rate. Who it's for: owners with a specific, repetitive business problem that doesn't fit a standard package but is genuinely worth automating on its own.",
  },
];

# Lead capture plan (approved by Mohammad, 2026-10-21)

Status: approved decisions. Build not started unless listed under "Build pending".
Supersedes the HubSpot routing in DECISIONS.md D-100 for Careers, Talent, Partnerships and Newsletter (see D-116).

## Rules that apply to every source
- Every email, from ZM77 or from the website, carries a working unsubscribe link. Unsubscribe stops all emails at once, marks the contact "Unsubscribed" in HubSpot and removes them from every follow-up list. Honoured immediately.
- Every ZM77-written client-facing email needs Mohammad's approval before it is sent, except the approved designs below (ODO report day-1 and the Cyber Health report email are approved to send as described).
- Business emails carry the company name, head office (Thunder Bay, Ontario) and the Toronto office. No personal name in outbound or company emails; they are signed "Oragrol Global".
- No prices, discounts or guarantees in any email beyond the catalogue. Live chat never quotes a price.
- Sender and recipient email addresses are not final (deferred by Mohammad). Current code defaults remain in place until he changes them.
- Canada anti-spam law (CASL): implied consent from an enquiry lasts about six months. Ongoing updates need the "Send me updates" tick box.

## 1. Live chat (website chat) — temperature: mid or dead
- Mid if the visitor asks about price, a person, discount, promotion or a finance question. Dead for everything else.
- Name and email are required; company is optional.
- Transcript emailed to the visitor and to Mohammad.
- Day-3 follow-up only, once. A reply stops it.
- HubSpot: short summary note on the contact. Full transcript deleted from HubSpot after 30 days. Monthly reminder to Mohammad to request deletion of the previous month's transcripts.
- If the HubSpot save fails, Mohammad is alerted.

## 2. My Scope — temperature: hot (private review) or PDF-only
- PDF-only path: name and email go to HubSpot as "My Scope (PDF only)". One email on day 3, then stop.
- Private review request: hot. Follow-ups on day 1, 3 and 10. After day 10 with no reply, stop; joins the 3-monthly cycle only if "Send me updates" is ticked.

## 3. ODO scan — always hot
- Report reviewed by Mohammad or his technical assistant within 2–24 hours before it is sent.
- Day-1 email written by ZM77 for each visitor: their name, company, thanks, a line that the report was reviewed, attachments (ODO report PDF and catalogue).
- Day-3 and day-10 follow-ups written by ZM77 for each visitor.
- After day 10 with no reply: 3-monthly cycle if updates box ticked.

## 4. Cyber Health — always hot
- No human review. The report is emailed right after the assessment finishes, target within 3 minutes.
- Email written by ZM77 with client details and thanks. Day-3 and day-10 follow-ups by ZM77.
- The email must be complete before it is sent. If ZM77 has a problem, Mohammad is alerted and no fallback email is sent.

## 5. Contact page — always hot
- Every submission creates or updates a HubSpot contact, lead source "Contact page", hot.
- Team inbox still receives the email.
- Visitor receives a ZM77-written acknowledgement (two-business-day response promise from the catalogue).
- "Send me updates" tick box added to the form; 3-monthly cycle applies if ticked.

## 6. Outbound — always hot
- Companies are contacted first with a ZM77-drafted introduction email. Each email names one public finding about that company, with its source link recorded. Mohammad approves each draft before sending.
- No follow-up emails after the introduction.
- Replies and form submissions are handled as contact-page leads.
- A company that fills in the form gets a ZM77-written confirmation email, approved by Mohammad before it is sent.
- Shortlisted companies are contacted by Mohammad directly.

## 7. Newsletter — dead as a lead (no follow-up)
- Stored only as a subscriber list in Brevo: first name (if given), email, sign-up date and source page, subscribed or unsubscribed. No copy in HubSpot.
- ZM77 drafts the monthly issue and reads the subscriber count from Brevo. Mohammad approves it. Brevo sends it to subscribed people only.
- Unsubscribe is handled by Brevo and honoured immediately.

## 8. Careers, Talent, Partnerships — no follow-up by ZM77 except partnerships
- One HubSpot group, "Careers, Talent & Partnerships", tagged career, talent or partnership. Record only; no temperature.
- Submission email still goes to the team inbox with its attachments.
- Attachments (CVs and other files) are kept with the HubSpot record, with access limited to Mohammad. Interim: HubSpot private file storage. Target: ZM77 document library once it is connected to Azure, with HubSpot holding only a link.
- Partnership requests: ZM77 writes a polite reply, approved by Mohammad before it is sent. Mohammad follows up personally after that.
- Careers and talent submissions: no ZM77 reply is decided yet (see Open items).

## Retention (approved)
- Attached files (CVs and similar): deleted 12 months after receipt, unless the person asks us to keep them or we are in active talks. Mohammad gets a reminder before each deletion.
- Live chat transcripts: deleted from HubSpot after 30 days.
- ODO and Cyber Health client PDFs: same 12-month rule, unless the client asks us to keep them. Interim storage: HubSpot private file storage. Target: ZM77 document library, HubSpot holds the link.

## Open items (not decided; must be settled before the build)
1. HubSpot free plan has about 10 custom contact properties and is nearly full. The new fields (source, temperature, updates tick box, unsubscribed status, retention date) need either reused fields or a plan change. Decide first.
2. Sender and recipient email addresses: deferred by Mohammad. Changing them later must not break any flow above.
3. ODO scan record retention: earlier notes conflict (6 months vs 10 years). Not decided.
4. Careers and talent submissions: whether ZM77 sends any acknowledgement (partnerships is decided; careers and talent are not).
5. "Send me updates" 3-monthly cycle does not fit outbound companies, who have no tick box. Outbound companies receive no updates emails unless they ask for them on a form, which is the current position.
6. The catalogue PDF is being updated by Mohammad; day-3 and day-10 emails attach the final version when it is ready.
7. Azure Blob connection for the ZM77 document library is not finished. Interim storage is HubSpot private file storage.

## Build pending (after Mohammad's go-ahead)
- Live chat: alert to Mohammad when the HubSpot save fails. Currently the visitor gets "ok" silently when the token is missing.
- ODO abandoned-scan handoff: claim-before-send bug. If the email fails, the lead is never retried. Fix to send first, then mark claimed.
- Unsubscribe handling across all sources, and the "Send me updates" tick box on chat, My Scope, scan, Contact and Careers forms.
- Contact page HubSpot write and acknowledgement email.
- ZM77 email writing for ODO, Cyber Health, Contact, Outbound and Partnerships, with approval gating.
- Monthly transcript-deletion reminder; 30-day HubSpot transcript removal.
- Newsletter: Brevo subscriber fields and the monthly ZM77 draft flow.
- Live tests of all eight sources, confirming HubSpot and inbox delivery. None recorded as tested yet.

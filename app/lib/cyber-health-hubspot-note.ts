/** Pure formatting only. No network calls, emails, CRM mutation or scoring.
 * Feed this the same validated server snapshot used for the client report.
 * Integrate according to Cyber_Health_HubSpot_Claude_Handoff.md.
 */
export interface AssessmentSnapshot {
  assessmentId: string;
  reportId: string;
  clientReference: string;
  completedAt: string;
  scoringVersion: string;
  sourcePath: string;
  profile: {
    name: string; email: string; phone: string; company: string;
    industry: string; province: string; employees: string; platform: string;
  };
  score: number;
  tier: string;
  maturity: string;
  categories: Array<{ id: string; name: string; score: number; status?: string }>;
  groups: Array<{ name: string; score: number; description?: string }>;
  snapshot: Array<{ label: string; score: number; status: string }>;
  findings: Array<{
    id: string; severity: string; title: string;
    details: Record<string, unknown>;
  }>;
  qualification: Array<{ id: string; label: string; answer: string }>;
  answers: Array<{ id: string; label: string; answer: string }>;
  quickWinIds: string[];
  roadmap: Array<{ label: string; findingIds: string[] }>;
  nextStep: { label: string; details: Record<string, unknown> };
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function formatAssessmentNotes(s: AssessmentSnapshot): Array<{
  part: number; totalParts: number; marker: string; plainText: string; html: string;
}> {
  if (!s.assessmentId || !s.reportId || !s.clientReference ||
      !Number.isFinite(Date.parse(s.completedAt)) ||
      !Number.isFinite(s.score) || s.score < 0 || s.score > 100) {
    throw new Error('Invalid authoritative assessment snapshot');
  }
  const p = s.profile;
  const lines = [
    'CYBER HEALTH ASSESSMENT',
    'Lead source: Cyber Health Assessment',
    'Event: Assessment completed',
    `Assessment ID: ${s.assessmentId}`,
    `Report ID: ${s.reportId}`,
    `Client reference: ${s.clientReference}`,
    `Completed at: ${s.completedAt}`,
    `Scoring version: ${s.scoringVersion}`,
    `Source page: ${s.sourcePath}`,
    '', 'CLIENT DETAILS',
    `Full name: ${p.name}`, `Email: ${p.email}`, `Phone: ${p.phone}`,
    `Company: ${p.company}`, `Business sector: ${p.industry}`,
    `Province: ${p.province}`, `Employees: ${p.employees}`, `Platform: ${p.platform}`,
    '', 'RESULT', `Score: ${s.score}/100`, `Overall score band: ${s.tier}`,
    `Maturity: ${s.maturity}`,
    `Total findings: ${s.findings.length}`,
    ...['Critical', 'High', 'Medium', 'Low'].map(severity =>
      `${severity} findings: ${s.findings.filter(f => f.severity === severity).length}`),
    '', 'CATEGORY RESULTS',
    ...s.categories.map(c => `${c.id} | ${c.name} | ${c.score}/100${c.status ? ` | ${c.status}` : ''}`),
    '', 'GROUP RESULTS',
    ...s.groups.map(g => `${g.name} | ${g.score}/100${g.description ? ` | ${g.description}` : ''}`),
    '', 'CONTROL SNAPSHOT',
    ...s.snapshot.map(x => `${x.label} | ${x.score}/100 | ${x.status}`),
    '', 'ALL FINDINGS',
    ...(s.findings.length ? s.findings.flatMap(f => [
      `${f.id} | ${f.severity} | ${f.title}`,
      JSON.stringify(f.details, null, 2), ''
    ]) : ['No findings identified from the supplied questionnaire answers.']),
    '', 'QUALIFICATION / CONTEXT',
    ...(s.qualification.length ? s.qualification.map(q => `${q.id} | ${q.label} | ${q.answer}`) : ['Not provided']),
    '', 'QUESTIONNAIRE ANSWERS',
    ...s.answers.map(q => `${q.id} | ${q.label} | ${q.answer}`),
    '', 'REPORT QUICK WINS', s.quickWinIds.join(', ') || 'None listed',
    '', 'REPORT ROADMAP',
    ...s.roadmap.map(r => `${r.label}: ${r.findingIds.join(', ') || 'None listed'}`),
    '', 'REPORT RECOMMENDATION',
    s.nextStep.label, JSON.stringify(s.nextStep.details, null, 2),
    '', 'WORKFLOW BOUNDARY',
    'Assessment completion is not a request for private review.',
    'No sales-agent action has been initiated by this integration.',
    'Score-dependent follow-up belongs to the future operations/sales-agent workflow.',
    'No PDF is stored in HubSpot.',
    '', 'LIMITATION',
    'Questionnaire-based assessment; not a technical audit, compliance certification or security guarantee.'
  ];
  // Bound escaped HTML size. Six characters per code unit is the worst escape
  // expansion used here; 6,000-character payload parts remain below 40K HTML.
  // This conservative transport budget is not a claim about an API field limit.
  const full = lines.join('\n');
  const chunks: string[] = [];
  let remaining = full;
  while (remaining.length) {
    let end = Math.min(6000, remaining.length);
    if (end < remaining.length) {
      const newline = remaining.lastIndexOf('\n', end - 1);
      if (newline > 3000) end = newline + 1;
      // Never split a UTF-16 surrogate pair.
      const previous = remaining.charCodeAt(end - 1);
      if (previous >= 0xD800 && previous <= 0xDBFF) end--;
    }
    chunks.push(remaining.slice(0, end)); remaining = remaining.slice(end);
  }
  return chunks.map((chunk, i) => {
    const marker = `CHA:${s.assessmentId}:part:${i + 1}`;
    const heading = `CYBER HEALTH ASSESSMENT | ${s.reportId} | Part ${i + 1}/${chunks.length}`;
    const plainText = `${heading}\nSync marker: ${marker}\n\n${chunk}`;
    return { part: i + 1, totalParts: chunks.length, marker, plainText,
      html: `<p>${esc(heading)}</p><p>Sync marker: ${esc(marker)}</p><p>${esc(chunk).replace(/\n/g, '<br>')}</p>` };
  });
}

/** Input count/latest choice must come from the durable authoritative ledger.
 * Never increment a HubSpot count using read-modify-write on webhook retries.
 */
export function latestAssessmentProperties(s: AssessmentSnapshot, uniqueCount: number): Record<string, string> {
  if (!Number.isSafeInteger(uniqueCount) || uniqueCount < 1) throw new Error('Invalid unique count');
  return {
    oragrol_cha_count: String(uniqueCount),
    oragrol_cha_latest_id: s.assessmentId,
    oragrol_cha_latest_report_id: s.reportId,
    oragrol_cha_latest_reference: s.clientReference,
    oragrol_cha_latest_at: String(Date.parse(s.completedAt)),
    oragrol_cha_score: String(s.score),
    oragrol_cha_band: s.tier,
    oragrol_cha_maturity: s.maturity,
    oragrol_cha_findings: String(s.findings.length),
    oragrol_cha_critical: String(s.findings.filter(f => f.severity === 'Critical').length),
    oragrol_cha_sector: s.profile.industry,
    oragrol_cha_province: s.profile.province,
    oragrol_cha_employees: s.profile.employees,
    oragrol_cha_platform: s.profile.platform,
    oragrol_cha_recommendation: s.nextStep.label,
  };
}

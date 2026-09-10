import {
  claimJob,
  completeJob,
  scheduleRetry,
  getAssessmentJobs,
  getAssessmentSnapshotJson,
  recordAssessmentInLedger,
  getLatestLedgerAssessmentId,
  getLedgerDistinctCount,
  withProjectionLock,
  normalizeContactIdentity,
  addCyberHealthNoteJobs,
  addLatestPropsJob,
  type CyberHealthJobRecord,
} from "./cyber-health-hubspot-store";
import {
  syncCyberHealthContact,
  createCyberHealthNote,
  findCyberHealthNoteByMarker,
  writeCyberHealthLatestProperties,
} from "./hubspot";
import { formatAssessmentNotes, latestAssessmentProperties, type AssessmentSnapshot } from "./cyber-health-hubspot-note";

/**
 * Lease duration: 5 minutes, same as My Scope's worker — must
 * comfortably exceed any single external call this file makes (one
 * HubSpot upsert, one note create, one property PATCH) with real
 * safety margin.
 */
const LEASE_MS = 5 * 60_000;

export async function processCyberHealthJob(jobId: string): Promise<{ outcome: string }> {
  const claim = await claimJob(jobId, LEASE_MS);
  if (!claim.claimed) {
    return { outcome: `not claimed: ${claim.reason}` };
  }
  const { owner, job } = claim;

  try {
    switch (job.type) {
      case "cha_contact":
        await runContactJob(job, owner);
        break;
      case "cha_note_part":
        await runNotePartJob(job, owner);
        break;
      case "cha_latest_props":
        await runLatestPropsJob(job, owner);
        break;
      default: {
        const exhaustiveCheck: never = job.type;
        throw new Error(`Unknown job type: ${exhaustiveCheck}`);
      }
    }
    return { outcome: "processed" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await scheduleRetry(jobId, owner, message);
    return { outcome: `failed, retry scheduled: ${message}` };
  }
}

async function loadSnapshot(assessmentId: string): Promise<AssessmentSnapshot> {
  const json = await getAssessmentSnapshotJson(assessmentId);
  if (!json) throw new Error(`No stored snapshot for assessment ${assessmentId}`);
  return JSON.parse(json) as AssessmentSnapshot;
}

async function runContactJob(job: CyberHealthJobRecord, owner: string): Promise<void> {
  const snapshot = await loadSnapshot(job.assessmentId);

  const result = await syncCyberHealthContact({
    name: snapshot.profile.name,
    email: snapshot.profile.email,
    phone: snapshot.profile.phone,
    company: snapshot.profile.company,
  });
  if (result.state === "failed") throw new Error(result.error);

  await completeJob(job.jobId, owner, result.contactId);

  // Only now — with a real, confirmed contact ID — create the note
  // part jobs. Never up front, so they can never race ahead of an ID
  // that doesn't exist yet (same principle as My Scope's hubspot_note).
  const parts = formatAssessmentNotes(snapshot);
  await addCyberHealthNoteJobs(job.assessmentId, parts);
}

async function runNotePartJob(job: CyberHealthJobRecord, owner: string): Promise<void> {
  if (job.partHtml === undefined || job.partMarker === undefined) {
    throw new Error(`cha_note_part job ${job.jobId} is missing partHtml/partMarker`);
  }

  const siblingJobs = await getAssessmentJobs(job.assessmentId);
  const contactJob = siblingJobs.find((j) => j.type === "cha_contact");
  const contactId = contactJob?.providerId;
  if (!contactId) throw new Error(`cha_contact has no recorded contact id for assessment ${job.assessmentId} yet`);

  const snapshot = await loadSnapshot(job.assessmentId);
  const timestampMs = Date.parse(snapshot.completedAt);

  const result = await createCyberHealthNote(contactId, job.partHtml, timestampMs);
  let noteId: string;
  if (result.state === "created") {
    noteId = result.noteId;
  } else {
    // Ambiguous/lost response — check whether the note actually landed
    // (via its embedded marker) before deciding this needs a retry.
    const existingNoteId = await findCyberHealthNoteByMarker(contactId, job.partMarker);
    if (!existingNoteId) throw new Error(result.error);
    noteId = existingNoteId;
  }
  await completeJob(job.jobId, owner, noteId);

  // If every note part for this assessment is now done, trigger the
  // latest-properties projection. Safe to call more than once if two
  // parts complete near-simultaneously — the projection job itself is
  // idempotent (always re-reads the current ledger top and writes
  // exactly that), so a rare duplicate trigger just means one harmless
  // extra write, never wrong data.
  const refreshed = await getAssessmentJobs(job.assessmentId);
  const noteJobs = refreshed.filter((j) => j.type === "cha_note_part");
  if (noteJobs.length > 0 && noteJobs.every((j) => j.status === "completed")) {
    await addLatestPropsJob(job.assessmentId);
  }
}

async function runLatestPropsJob(job: CyberHealthJobRecord, owner: string): Promise<void> {
  const thisSnapshot = await loadSnapshot(job.assessmentId);
  const identity = normalizeContactIdentity(thisSnapshot.profile.email);

  // Ledger entry should already exist (written when the assessment was
  // first accepted, before any job ran) — record again defensively;
  // ZADD is idempotent, so this is harmless if already present.
  await recordAssessmentInLedger(identity, job.assessmentId, Date.parse(thisSnapshot.completedAt));

  const outcome = await withProjectionLock(identity, async () => {
    const latestId = await getLatestLedgerAssessmentId(identity);
    if (!latestId) throw new Error(`Ledger for ${identity} unexpectedly empty during projection`);

    const latestSnapshot = await loadSnapshot(latestId);
    const latestJobs = await getAssessmentJobs(latestId);
    const latestContactJob = latestJobs.find((j) => j.type === "cha_contact");
    const contactId = latestContactJob?.providerId;
    if (!contactId) {
      // The latest assessment's own contact sync hasn't completed yet
      // — legitimate transient state, not a bug. Retry later.
      throw new Error(`cha_contact for the current latest assessment (${latestId}) has no contact id yet`);
    }

    const distinctCount = await getLedgerDistinctCount(identity);
    const properties = latestAssessmentProperties(latestSnapshot, distinctCount);
    const writeResult = await writeCyberHealthLatestProperties(contactId, properties);
    if (writeResult.state === "failed") throw new Error(writeResult.error);
    return { wrote: true };
  });

  if ("locked" in outcome) {
    // Another projection for this contact is in flight — this job's
    // purpose (make sure the latest state gets written) is already
    // being served by that one. Treat as a retryable condition so it
    // checks again shortly rather than either completing falsely or
    // erroring.
    throw new Error(`Projection lock held for ${identity} — will retry`);
  }

  await completeJob(job.jobId, owner);
}

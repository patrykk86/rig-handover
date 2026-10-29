import fs from 'node:fs';
import path from 'node:path';
import type { DigestRow, JobStatus, NightDigest } from './types.js';

interface RawRunEntry {
  at: string;
  job: string;
  status: JobStatus;
  owner?: string | null;
  error?: string | null;
}

function isValidStatus(status: unknown): status is JobStatus {
  return status === 'ok' || status === 'retry' || status === 'fail';
}

function isValidEntry(obj: unknown): obj is RawRunEntry {
  if (typeof obj !== 'object' || obj === null) return false;
  const record = obj as Record<string, unknown>;
  return (
    typeof record.at === 'string' &&
    record.at.length > 0 &&
    typeof record.job === 'string' &&
    record.job.length > 0 &&
    isValidStatus(record.status)
  );
}

export function readNight(runsDir: string, night: string): NightDigest | null {
  const filePath = path.join(runsDir, `${night}.jsonl`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  const jobMap = new Map<string, DigestRow>();
  let badLines = 0;
  const counts = { ok: 0, retry: 0, fail: 0 };

  for (const line of lines) {
    if (line.trim() === '') {
      continue;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(line);
    } catch {
      badLines += 1;
      continue;
    }

    if (!isValidEntry(parsed)) {
      badLines += 1;
      continue;
    }

    counts[parsed.status] += 1;

    const ownerVal =
      typeof parsed.owner === 'string' && parsed.owner.trim().length > 0
        ? parsed.owner.trim()
        : null;

    const errorVal =
      typeof parsed.error === 'string' && parsed.error.trim().length > 0
        ? parsed.error
        : null;

    const existing = jobMap.get(parsed.job);
    if (!existing) {
      jobMap.set(parsed.job, {
        job: parsed.job,
        owner: ownerVal ?? '—',
        runs: 1,
        retries: parsed.status === 'retry' ? 1 : 0,
        lastStatus: parsed.status,
        lastError: errorVal,
        firstAt: parsed.at,
        lastAt: parsed.at,
      });
    } else {
      existing.runs += 1;
      if (parsed.status === 'retry') {
        existing.retries += 1;
      }
      existing.lastStatus = parsed.status;
      if (errorVal !== null) {
        existing.lastError = errorVal;
      }
      if (ownerVal !== null) {
        existing.owner = ownerVal;
      }
      if (parsed.at < existing.firstAt) {
        existing.firstAt = parsed.at;
      }
      if (parsed.at >= existing.lastAt) {
        existing.lastAt = parsed.at;
      }
    }
  }

  return {
    night,
    rows: Array.from(jobMap.values()),
    badLines,
    counts,
  };
}


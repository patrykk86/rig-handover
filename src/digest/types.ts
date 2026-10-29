export type JobStatus = 'ok' | 'retry' | 'fail';

export interface DigestRow {
  job: string;
  owner: string;
  runs: number;
  retries: number;
  lastStatus: JobStatus;
  lastError: string | null;
  firstAt: string;
  lastAt: string;
}

export interface NightDigest {
  night: string;
  rows: DigestRow[];
  badLines: number;
  counts: {
    ok: number;
    retry: number;
    fail: number;
  };
}

export type ReadNightFn = (runsDir: string, night: string) => NightDigest | null;


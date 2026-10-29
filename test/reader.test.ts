import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { readNight } from '../src/digest/reader.js';

describe('readNight', () => {
  it('reads and aggregates 2026-10-28 correctly', () => {
    const digest = readNight('runs', '2026-10-28');

    expect(digest).not.toBeNull();
    if (!digest) return;

    expect(digest.night).toBe('2026-10-28');
    expect(digest.rows.length).toBe(5);
    expect(digest.badLines).toBe(1);

    const fixturesRefresh = digest.rows.find((r) => r.job === 'fixtures/refresh');
    expect(fixturesRefresh).toBeDefined();
    expect(fixturesRefresh?.runs).toBe(4);
    expect(fixturesRefresh?.retries).toBe(3);
    expect(fixturesRefresh?.lastStatus).toBe('ok');
    expect(fixturesRefresh?.owner).toBe('rook');

    const notesBackup = digest.rows.find((r) => r.job === 'notes/backup');
    expect(notesBackup).toBeDefined();
    expect(notesBackup?.lastStatus).toBe('fail');
    expect(notesBackup?.lastError).toBe('quota exceeded');

    const digestRender = digest.rows.find((r) => r.job === 'digest/render');
    expect(digestRender).toBeDefined();
    expect(digestRender?.owner).toBe('—');
  });

  it('returns null for a non-existent night', () => {
    const digest = readNight('runs', '1999-01-01');
    expect(digest).toBeNull();
  });

  it('returns empty rows and 0 badLines for an empty night file', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rig-handover-test-'));
    try {
      fs.writeFileSync(path.join(tmpDir, '2026-10-29.jsonl'), '', 'utf8');
      const digest = readNight(tmpDir, '2026-10-29');

      expect(digest).not.toBeNull();
      if (!digest) return;

      expect(digest.night).toBe('2026-10-29');
      expect(digest.rows).toEqual([]);
      expect(digest.badLines).toBe(0);
      expect(digest.counts).toEqual({ ok: 0, retry: 0, fail: 0 });
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});


import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createApp } from '../src/app.js';

const config = {
  adapter: 'shim',
  installed: '2026-10-29T14:06:00+01:00',
  beatEverySeconds: 60,
  runsDir: 'runs',
};

describe('digest routes', () => {
  it('GET /digest/2026-10-28 returns 200 and renders jobs', async () => {
    process.env.LANE_MARKER = 'tbuz-62fu';
    const app = createApp(config);
    const res = await app.request('/digest/2026-10-28');
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('digest · 2026-10-28');
    expect(html).toContain('tbuz-62fu');
    expect(html).toContain('fixtures/refresh');
    expect(html).toContain('notes/backup');
  });

  it('GET /api/digest/2026-10-28 returns JSON with sorted rows matching page', async () => {
    const app = createApp(config);
    const res = await app.request('/api/digest/2026-10-28');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.night).toBe('2026-10-28');
    expect(data.rows.length).toBe(5);

    // Verify sorted ascending by job
    const jobs = data.rows.map((r: { job: string }) => r.job);
    const sortedJobs = [...jobs].sort();
    expect(jobs).toEqual(sortedJobs);
  });

  it('GET /digest/nonexistent returns 404', async () => {
    const app = createApp(config);
    const res = await app.request('/digest/1999-01-01');
    expect(res.status).toBe(404);
  });

  it('GET /api/digest/nonexistent returns 404', async () => {
    const app = createApp(config);
    const res = await app.request('/api/digest/1999-01-01');
    expect(res.status).toBe(404);
  });

  it('empty night renders "nothing ran"', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rig-test-empty-'));
    try {
      fs.writeFileSync(path.join(tmpDir, '2026-10-30.jsonl'), '', 'utf8');
      const emptyConfig = { ...config, runsDir: tmpDir };
      const app = createApp(emptyConfig);

      const htmlRes = await app.request('/digest/2026-10-30');
      expect(htmlRes.status).toBe(200);
      const html = await htmlRes.text();
      expect(html).toContain('nothing ran');

      const jsonRes = await app.request('/api/digest/2026-10-30');
      expect(jsonRes.status).toBe(200);
      const json = await jsonRes.json();
      expect(json.rows).toEqual([]);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('status board links each night to digest with counts', async () => {
    const app = createApp(config);
    const res = await app.request('/');
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('href="/digest/2026-10-28"');
    expect(html).toContain('href="/digest/2026-10-27"');
    expect(html).toContain('fail');
  });
});


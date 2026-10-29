import type { NightDigest } from '../digest/types.js';

export function DigestPage({ digest }: { digest: NightDigest }) {
  const rows = [...digest.rows].sort((a, b) => a.job.localeCompare(b.job));

  return (
    <>
      <h1>digest · {digest.night}</h1>
      <p class="mute">
        <a href="/">← status</a> · {digest.counts.ok} ok · {digest.counts.retry} retry ·{' '}
        <span class={digest.counts.fail > 0 ? 'warn' : ''}>{digest.counts.fail} fail</span>
        {digest.badLines > 0 ? <span class="warn"> · {digest.badLines} bad lines</span> : null}
      </p>

      {rows.length === 0 ? (
        <p class="mute">nothing ran</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>job</th>
              <th>owner</th>
              <th>runs</th>
              <th>retries</th>
              <th>status</th>
              <th>last error</th>
              <th>time</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const isWarnRetries = r.retries >= 3;
              const isFail = r.lastStatus === 'fail';
              return (
                <tr key={r.job}>
                  <td>{r.job}</td>
                  <td>{r.owner}</td>
                  <td>{r.runs}</td>
                  <td class={isWarnRetries ? 'warn' : ''}>{r.retries}</td>
                  <td class={isFail ? 'warn' : ''}>{r.lastStatus}</td>
                  <td class={r.lastError ? 'warn' : 'mute'}>{r.lastError ?? '—'}</td>
                  <td class="mute">
                    {r.firstAt === r.lastAt ? r.firstAt : `${r.firstAt} → ${r.lastAt}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}


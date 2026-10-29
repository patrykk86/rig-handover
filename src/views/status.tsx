import type { Status } from '../status.js';

export function StatusBoard({ status }: { status: Status }) {
  return (
    <>
      <h1>status</h1>
      <table>
        <tbody>
          <tr><th>adapter</th><td>{status.adapter}</td></tr>
          <tr><th>installed</th><td>{status.installed}</td></tr>
          <tr>
            <th>last beat</th>
            <td>{status.lastBeat ? `${status.lastBeat.at} · pid ${status.lastBeat.pid}` : <span class="warn">none</span>}</td>
          </tr>
        </tbody>
      </table>
      <h2>nights on disk</h2>
      {status.summaries.length === 0 ? (
        <p class="mute">nothing in runs/</p>
      ) : (
        <ul>
          {status.summaries.map((s) => (
            <li key={s.night}>
              <a href={`/digest/${s.night}`}>{s.night}</a>{' '}
              <span class="mute">
                {s.counts.ok} ok · {s.counts.retry} retry ·{' '}
                <span class={s.counts.fail > 0 ? 'warn' : ''}>{s.counts.fail} fail</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

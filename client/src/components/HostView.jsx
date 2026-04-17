import { useState } from 'react';
import { RUNNERS } from '../data/constants';
import Runners from './Runners';

const TASKS = [
  { t: 'Buy bibs (Amazon, 2-day ship)', due: 'Due Apr 22', done: false },
  { t: 'Confirm volunteer pourers at each mile', due: 'Due Apr 25', done: true },
  { t: 'Send reminder to the 4 Maybes', due: 'Due Apr 30', done: false },
  { t: 'Get finish-line champagne', due: 'Due May 22', done: false },
  { t: 'Book post-run taco truck', due: 'Due May 10', done: false },
];

export default function HostView({ liveRsvp }) {
  const [tasks, setTasks] = useState(TASKS);

  const going = RUNNERS.filter(r => r.status === 'going').length + (liveRsvp?.status === 'going' ? 1 : 0);
  const maybe = RUNNERS.filter(r => r.status === 'maybe').length + (liveRsvp?.status === 'maybe' ? 1 : 0);

  const toggleTask = (i) => {
    setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, done: !t.done } : t));
  };

  return (
    <>
      <section className="section">
        <div className="sec-head">
          <div>
            <div className="sec-num">H.01 / CONTROL ROOM</div>
            <h2 className="sec-title">You're the captain.<br />Don't crash the boat.</h2>
          </div>
          <p className="sec-desc">
            36 days out. Still time to panic. Everything you need to run
            the run, minus the actual running.
          </p>
        </div>

        <div className="host-grid">
          {[
            { label: 'Confirmed runners', val: going, delta: '+3 this week' },
            { label: 'On the fence', val: maybe, delta: 'chase them monday' },
            { label: 'Beer pledged (cans)', val: 117, delta: 'target: 180' },
            { label: 'Budget remaining', val: '$412', delta: 'bibs not ordered', warn: true },
          ].map((k, i) => (
            <div key={i} className="kpi">
              <div className="label">{k.label}</div>
              <div className="val">{k.val}</div>
              <div className="delta" style={k.warn ? { color: 'var(--warn)' } : undefined}>{k.delta}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16 }}>
          <div className="kpi" style={{ padding: 24 }}>
            <div className="label">NEXT ACTIONS</div>
            <ul style={{ margin: '10px 0 0 0', padding: 0, listStyle: 'none' }}>
              {tasks.map((task, i) => (
                <li key={i} onClick={() => toggleTask(i)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0', borderBottom: '1px solid color-mix(in oklab, var(--rule), transparent 85%)',
                  fontSize: 14, cursor: 'pointer',
                  textDecoration: task.done ? 'line-through' : 'none',
                  opacity: task.done ? 0.5 : 1,
                }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: 4,
                    border: '2px solid var(--rule)',
                    background: task.done ? 'var(--punch)' : 'transparent',
                    flexShrink: 0,
                  }} />
                  <span style={{ flex: 1 }}>{task.t}</span>
                  <span className="mono" style={{ fontSize: 11, opacity: 0.6 }}>{task.due}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="kpi" style={{ padding: 24 }}>
            <div className="label">BROADCAST</div>
            <textarea
              placeholder="Message to all confirmed runners..."
              style={{
                width: '100%', minHeight: 100, marginTop: 10, padding: 12,
                border: '1.5px solid var(--rule)', borderRadius: 10,
                background: 'var(--paper)', color: 'var(--ink)',
                font: 'inherit', fontSize: 14, resize: 'none',
                fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
              }}
              defaultValue="heads up — pick up your bib from the bandstand at 10:30. maya is bringing extra stout for the pergola stop. don't be late."
            />
            <button style={{
              marginTop: 10, width: '100%', padding: '12px',
              background: 'var(--stout)', color: 'var(--paper)',
              border: 'none', borderRadius: 10,
              fontFamily: 'Anton, sans-serif', fontSize: 18,
              textTransform: 'uppercase', cursor: 'pointer', letterSpacing: '0.02em',
            }}>
              Send to {going} runners →
            </button>
          </div>
        </div>
      </section>
      <Runners liveRsvp={liveRsvp} />
    </>
  );
}

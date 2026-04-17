import { useState, useMemo } from 'react';
import { mergeRsvps } from '../data/mergeRsvps';

const FINE_PRINT = [
  'Run is self-timed. Honor system. We have a spreadsheet.',
  'BYO beer (min 3, nothing above 6.5% ABV please)',
  'Bathrooms at Bandstand, Sailboat House, Pergola',
  'If you puke, you\'re on cleanup. This is in the bylaws.',
  'Rain delays to Sunday. Hurricane cancels.',
];

export default function RSVP({ onRsvp, rsvpStatus, apiRsvps = [] }) {
  const [name, setName] = useState('');
  const [beer, setBeer] = useState('');
  const [status, setStatus] = useState(rsvpStatus || null);
  const [confirmed, setConfirmed] = useState(false);
  const [bibNum] = useState(() => Math.floor(Math.random() * 89) + 10);

  const submit = async () => {
    if (!status || !name.trim()) return;
    try {
      await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, beer, status }),
      });
    } catch {}
    setConfirmed(true);
    onRsvp?.({ name, beer, status });
  };

  if (confirmed) {
    return (
      <section className="section" id="rsvp">
        <div className="sec-head">
          <div>
            <div className="sec-num">02 / RSVP</div>
            <h2 className="sec-title">You're in.</h2>
          </div>
        </div>
        <div className="rsvp">
          <div className="rsvp-card" style={{ alignItems: 'flex-start' }}>
            <div className="bottle-seal" style={{ transform: 'rotate(-4deg)', width: 120, height: 120, fontSize: 15 }}>
              Bib<br />#{bibNum}<br />Confirmed
            </div>
            <h3 className="rsvp-prompt" style={{ fontSize: 36 }}>
              See you at the Bandstand, {name.split(' ')[0] || 'legend'}.
            </h3>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: 'var(--muted)' }}>
              We logged you as <strong style={{ color: 'var(--ink)' }}>{status.toUpperCase()}</strong>
              {beer ? <> · bringing <strong style={{ color: 'var(--ink)' }}>{beer}</strong></> : null}.
              Check email for your bib number and the group chat invite.
            </p>
            <button className="rsvp-confirm" onClick={() => setConfirmed(false)}>
              Change my answer
              <span className="mono" style={{ fontSize: 11, opacity: 0.7 }}>↻</span>
            </button>
          </div>
          <div className="rsvp-side">
            <div className="sec-num">THE FINE PRINT</div>
            <ul className="fineprint">
              {FINE_PRINT.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        </div>
      </section>
    );
  }

  const combined = useMemo(() => mergeRsvps(apiRsvps), [apiRsvps]);
  const going = combined.filter(r => r.status === 'going').length;
  const maybe = combined.filter(r => r.status === 'maybe').length;

  return (
    <section className="section" id="rsvp">
      <div className="sec-head">
        <div>
          <div className="sec-num">02 / RSVP</div>
          <h2 className="sec-title">Are you in?</h2>
        </div>
        <p className="sec-desc">
          Tell us where you land. Don't lie — we're capping at 40 and
          Maya's already asked if she can bring her coworkers.
        </p>
      </div>
      <div className="rsvp">
        <div className="rsvp-card">
          <h3 className="rsvp-prompt">Pick your fate.</h3>
          <div className="rsvp-buttons">
            {[
              { k: 'going', label: "I'm in", sub: 'bring beer, bring shame' },
              { k: 'maybe', label: 'Maybe', sub: 'depends on the hangover' },
              { k: 'out', label: "Can't make it", sub: 'coward' },
            ].map(({ k, label, sub }) => (
              <button
                key={k}
                className={`rsvp-btn ${k} ${status === k ? 'selected' : ''}`}
                onClick={() => setStatus(k)}
              >
                {label}
                <span className="sub">{sub}</span>
              </button>
            ))}
          </div>
          <input
            className="rsvp-input"
            placeholder="Your name (the one on your ID)"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            className="rsvp-input"
            placeholder="What are you bringing? (e.g. 6-pack of IPA, kombucha if you're out)"
            value={beer}
            onChange={e => setBeer(e.target.value)}
          />
          <button
            className="rsvp-confirm"
            disabled={!status || !name.trim()}
            onClick={submit}
          >
            {status === 'out' ? 'Send regrets' : 'Lock it in'}
            <span className="mono" style={{ fontSize: 12, opacity: 0.7 }}>→</span>
          </button>
        </div>
        <div className="rsvp-side">
          <div className="sec-num">THE FINE PRINT</div>
          <ul className="fineprint">
            {FINE_PRINT.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
          <div style={{ borderTop: '1.5px solid var(--rule)', paddingTop: 14, marginTop: 8 }}>
            <div className="sec-num" style={{ marginBottom: 6 }}>HEAD COUNT</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Anton', sans-serif", fontSize: 28, textTransform: 'uppercase' }}>
              <span>In</span>
              <span style={{ color: 'var(--punch)', background: 'var(--stout)', padding: '2px 12px', borderRadius: 8 }}>
                {going}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Anton', sans-serif", fontSize: 20, textTransform: 'uppercase', opacity: 0.6, marginTop: 4 }}>
              <span>Maybe</span>
              <span>{maybe}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

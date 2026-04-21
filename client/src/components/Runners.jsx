import { useState, useMemo } from 'react';
import { mergeRsvps } from '../data/mergeRsvps';

const AVATAR_HUES = ['#B8701C', '#8A4F12', '#E89944', '#1F1410', '#C8F03C', '#C87E24', '#6B5A45', '#5A3E2B', '#A05A18'];

function hueFor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_HUES.length;
  return AVATAR_HUES[h];
}

function initials(name) {
  return name.split(' ').map(p => p[0]).slice(0, 2).join('');
}

export default function Runners({ apiRsvps = [], onDelete }) {
  const [filter, setFilter] = useState('all');

  const allRunners = useMemo(() => mergeRsvps(apiRsvps), [apiRsvps]);

  const shown = allRunners.filter(r => filter === 'all' || r.status === filter);
  const counts = {
    all: allRunners.length,
    going: allRunners.filter(r => r.status === 'going').length,
    maybe: allRunners.filter(r => r.status === 'maybe').length,
    out: allRunners.filter(r => r.status === 'out').length,
  };

  return (
    <section className="section" id="runners">
      <div className="sec-head">
        <div>
          <div className="sec-num">04 / THE FIELD</div>
          <h2 className="sec-title">
            {counts.going} confirmed.<br />
            {counts.maybe} wobbly.
          </h2>
        </div>
        <p className="sec-desc">
          Start trash-talking early. Paces self-reported — believe them
          at your own peril.
        </p>
      </div>
      <div className="runners-head">
        {[
          { k: 'all', l: 'Everyone' },
          { k: 'going', l: 'Going' },
          { k: 'maybe', l: 'Maybe' },
          { k: 'out', l: 'Out' },
        ].map(f => (
          <button
            key={f.k}
            className={`filter-chip ${filter === f.k ? 'active' : ''}`}
            onClick={() => setFilter(f.k)}
          >
            {f.l} <span style={{ opacity: 0.6, marginLeft: 4 }}>{counts[f.k]}</span>
          </button>
        ))}
      </div>
      <div className="runners-grid">
        {shown.map((r, i) => (
          <div key={i} className={`runner ${r.status}`} style={{ position: 'relative' }}>
            <div className="avatar" style={{ background: hueFor(r.name) }}>
              {initials(r.name)}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="runner-name">{r.name}</div>
              <div className="runner-meta">{r.pace ? `${r.pace} · ${r.note}` : r.note}</div>
              <span className="runner-status-pill">
                {r.status === 'going' ? 'IN' : r.status === 'maybe' ? 'MAYBE' : 'OUT'}
              </span>
            </div>
            {onDelete && r._id && (
              <button
                onClick={e => { e.stopPropagation(); onDelete(r._id); }}
                title="Remove runner"
                style={{
                  position: 'absolute', top: 10, right: 10,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--muted)', fontSize: 16, lineHeight: 1,
                  padding: 4, borderRadius: 4, opacity: 0.5,
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

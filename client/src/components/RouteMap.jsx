import { useState } from 'react';
import { STOPS } from '../data/constants';

// Marker positions in 866×896 satellite image coordinates
const MARKERS = [
  { x: 489, y: 642, label: 'LAKESHORE' },
  { x: 497, y: 269, label: 'BIRD SANCTUARY' },
  { x: 105, y: 272, label: 'SNOW PARK' },
];

export default function RouteMap() {
  const [active, setActive] = useState(0);

  return (
    <section className="section" id="route">
      <div className="sec-head">
        <div>
          <div className="sec-num">03 / ROUTE</div>
          <h2 className="sec-title">Three miles.<br />Three beers.</h2>
        </div>
        <p className="sec-desc">
          Counter-clockwise around the lake, like any reasonable person.
          Volunteer pourers at each stop. Click a mile to preview what
          you're chugging.
        </p>
      </div>
      <div className="route-wrap">
        <div className="route-map route-map--sat">
          <img
            src="/lake-merritt-satellite.png"
            alt="Lake Merritt satellite view"
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover',
              objectPosition: '47% 52%',
              display: 'block',
              filter: 'sepia(0.55) saturate(0.7) brightness(0.68) contrast(1.12)',
            }}
          />
          {/* Amber wash */}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(184,112,28,0.16)', pointerEvents: 'none' }} />
          {/* Edge vignette */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 50%, rgba(31,20,16,0.6) 100%)', pointerEvents: 'none' }} />
          {/* SVG overlay */}
          <svg viewBox="0 0 866 896" preserveAspectRatio="xMidYMid meet"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            {/* Compass */}
            <g transform="translate(822, 852)">
              <circle r="22" fill="var(--paper)" stroke="var(--rule)" strokeWidth="1.5" opacity="0.92" />
              <text y="-2" textAnchor="middle" fontFamily="'Anton', sans-serif" fontSize="14" fill="var(--rule)">N</text>
              <line x1="0" y1="5" x2="0" y2="16" stroke="var(--rule)" strokeWidth="1.5" />
            </g>
            {/* Markers */}
            {MARKERS.map((m, i) => {
              const isActive = active === i;
              const isFinish = i === MARKERS.length - 1;
              const labelY = m.y < 350 ? m.y + 42 : m.y - 38;
              return (
                <g key={i} style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => setActive(i)}>
                  {isActive && <circle cx={m.x} cy={m.y} r={38} fill="var(--punch)" opacity="0.22" />}
                  <circle cx={m.x} cy={m.y} r={isActive ? 28 : 22}
                    fill={isActive ? 'var(--punch)' : 'var(--stout)'}
                    stroke={isActive ? 'var(--stout)' : 'var(--punch)'}
                    strokeWidth="2.5" />
                  <text x={m.x} y={m.y + 7} textAnchor="middle"
                    fontFamily="'Anton', sans-serif" fontSize="18"
                    fill={isActive ? 'var(--punch-ink)' : 'var(--punch)'}>
                    {isFinish ? 'FIN' : i + 1}
                  </text>
                  <text x={m.x} y={labelY} textAnchor="middle"
                    fontFamily="'JetBrains Mono', monospace" fontSize="13"
                    stroke="rgba(31,20,16,0.9)" strokeWidth="4" strokeLinejoin="round"
                    letterSpacing="1.5" paintOrder="stroke" fill="white">
                    {m.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="route-stops">
          {STOPS.map((s, i) => (
            <div key={i} className={`stop ${active === i ? 'active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}>
              <div className="stop-km">{s.km}</div>
              <div>
                <div className="stop-name">{s.name}</div>
                <div className="stop-sub">{s.sub}</div>
              </div>
              <div className="stop-beer">
                <strong>{s.beer}</strong>
                {s.brand}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

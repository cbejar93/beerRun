import { useState } from 'react';
import { STOPS } from '../data/constants';

const PATH_D = 'M 160 90 C 260 50, 420 60, 500 140 C 560 200, 550 300, 480 380 C 400 460, 260 470, 160 400 C 80 340, 70 180, 160 90 Z';

const MARKERS = [
  { x: 160, y: 90 },
  { x: 500, y: 140 },
  { x: 480, y: 380 },
  { x: 160, y: 400 },
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
        <div className="route-map">
          <svg viewBox="0 0 600 480" preserveAspectRatio="xMidYMid meet">
            <defs>
              <pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="var(--rule)" opacity="0.12" />
              </pattern>
            </defs>
            <rect width="600" height="480" fill="url(#dots)" />
            <path
              d="M 180 130 C 260 100, 400 110, 460 170 C 510 220, 500 300, 440 360 C 370 420, 260 420, 190 370 C 120 320, 120 190, 180 130 Z"
              fill="var(--amber)"
              opacity="0.15"
              stroke="var(--rule)"
              strokeWidth="1.5"
              strokeDasharray="4 6"
            />
            <text x="310" y="260" textAnchor="middle" fontFamily="'Anton', sans-serif" fontSize="44"
              fill="var(--rule)" opacity="0.35" letterSpacing="2">LAKE MERRITT</text>
            <path d={PATH_D} fill="none" stroke="var(--stout)" strokeWidth="5"
              strokeLinecap="round" strokeLinejoin="round" />
            <path d={PATH_D} fill="none" stroke="var(--punch)" strokeWidth="2"
              strokeDasharray="3 8" strokeLinecap="round" />
            {MARKERS.map((m, i) => {
              const isActive = active === i;
              const isFinish = i === MARKERS.length - 1;
              return (
                <g key={i} style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => setActive(i)}>
                  <circle cx={m.x} cy={m.y} r={isActive ? 26 : 20}
                    fill={isActive ? 'var(--punch)' : 'var(--stout)'}
                    stroke="var(--rule)" strokeWidth="2"
                    style={{ transition: 'r 0.2s' }} />
                  <text x={m.x} y={m.y + 5} textAnchor="middle"
                    fontFamily="'Anton', sans-serif" fontSize="16"
                    fill={isActive ? 'var(--punch-ink)' : 'var(--punch)'}>
                    {isFinish ? 'FIN' : i + 1}
                  </text>
                  <text x={m.x} y={m.y - 28} textAnchor="middle"
                    fontFamily="'JetBrains Mono', monospace" fontSize="10"
                    fill="var(--rule)" letterSpacing="1">
                    {STOPS[i].name.slice(0, 18).toUpperCase()}
                  </text>
                </g>
              );
            })}
            <g transform="translate(540, 440)">
              <circle r="20" fill="var(--paper)" stroke="var(--rule)" strokeWidth="1.5" />
              <text y="-2" textAnchor="middle" fontFamily="'Anton', sans-serif" fontSize="12" fill="var(--rule)">N</text>
              <line x1="0" y1="5" x2="0" y2="14" stroke="var(--rule)" strokeWidth="1" />
            </g>
          </svg>
        </div>
        <div className="route-stops">
          {STOPS.map((s, i) => (
            <div
              key={i}
              className={`stop ${active === i ? 'active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
            >
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

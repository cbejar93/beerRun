import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MEDALS = ['🥇', '🥈', '🥉'];

function formatGap(ms) {
  if (ms === 0) return 'LEADER';
  const totalSecs = Math.floor(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `+${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true,
  });
}

export default function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () =>
      fetch('/api/results')
        .then(r => r.json())
        .then(data => { setResults(data); setLoading(false); })
        .catch(() => setLoading(false));
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  const leaderTime = results[0] ? new Date(results[0].finishedAt).getTime() : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <nav className="nav">
        <div className="nav-inner">
          <Link className="brand" to="/">
            <div className="brand-mark">3</div>
            <span>Beer Run · '26</span>
          </Link>
          <div className="nav-meta mono">
            <span>RESULTS · MAY 23</span>
          </div>
        </div>
      </nav>

      <section className="section">
        <div className="sec-head">
          <div>
            <div className="sec-num">FINISH LINE</div>
            <h2 className="sec-title">
              {results.length === 0 ? 'Race in progress.' : `${results.length} finished.`}
            </h2>
          </div>
          {results.length > 0 && (
            <p className="sec-desc">
              Times are relative to the leader. Refreshes every 15 seconds.
            </p>
          )}
        </div>

        {loading && (
          <p className="mono" style={{ opacity: 0.5, fontSize: 13 }}>Loading…</p>
        )}

        {!loading && results.length === 0 && (
          <div style={{
            border: '2px dashed var(--rule)', borderRadius: 16,
            padding: '60px 24px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 32, textTransform: 'uppercase', opacity: 0.3 }}>
              No finishers yet
            </div>
            <div className="mono" style={{ fontSize: 12, opacity: 0.4, marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Check back when the race starts
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.map((r, i) => {
              const gap = leaderTime ? new Date(r.finishedAt).getTime() - leaderTime : 0;
              const isLeader = i === 0;
              return (
                <div key={r._id} style={{
                  display: 'grid',
                  gridTemplateColumns: '56px 1fr auto auto',
                  alignItems: 'center',
                  gap: 16,
                  padding: '18px 20px',
                  border: `2px solid ${isLeader ? 'var(--punch)' : 'var(--rule)'}`,
                  borderRadius: 14,
                  background: isLeader ? 'color-mix(in oklab, var(--punch), transparent 88%)' : 'var(--card)',
                }}>
                  <div style={{
                    fontFamily: "'Anton', sans-serif",
                    fontSize: i < 3 ? 28 : 22,
                    textAlign: 'center',
                    lineHeight: 1,
                  }}>
                    {i < 3 ? MEDALS[i] : `#${i + 1}`}
                  </div>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, textTransform: 'uppercase', letterSpacing: '0.01em' }}>
                    {r.name}
                  </div>
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    fontWeight: 600,
                    color: isLeader ? 'var(--punch)' : 'var(--ink)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    whiteSpace: 'nowrap',
                  }}>
                    {formatGap(gap)}
                  </div>
                  <div className="mono" style={{ fontSize: 11, opacity: 0.5, whiteSpace: 'nowrap' }}>
                    {formatTime(r.finishedAt)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <footer className="foot">
        <span>© 2026 BEER RUN SOCIETY · OAKLAND CA</span>
        <span>CHUG RESPONSIBLY · RUN WITH FRIENDS</span>
      </footer>
    </div>
  );
}

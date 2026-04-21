import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MEDALS = ['🥇', '🥈', '🥉'];

function formatElapsed(ms) {
  const totalSecs = Math.floor(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function Results() {
  const [startedAt, setStartedAt] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    fetch('/api/results')
      .then(r => r.json())
      .then(data => {
        setStartedAt(data.startedAt ? new Date(data.startedAt) : null);
        setResults(data.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

  useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, []);

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
              {!startedAt
                ? 'Race not started.'
                : results.length === 0
                  ? 'Race in progress.'
                  : `${results.length} finished.`}
            </h2>
          </div>
          {startedAt && results.length > 0 && (
            <p className="sec-desc">
              Times from gun to finish line. Refreshes every 10 seconds.
            </p>
          )}
        </div>

        {loading && (
          <p className="mono" style={{ opacity: 0.5, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Loading…
          </p>
        )}

        {!loading && !startedAt && (
          <div style={{
            border: '2px dashed var(--rule)', borderRadius: 16,
            padding: '60px 24px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, textTransform: 'uppercase', opacity: 0.3 }}>
              Waiting for the start gun
            </div>
          </div>
        )}

        {!loading && startedAt && results.length === 0 && (
          <div style={{
            border: '2px dashed var(--rule)', borderRadius: 16,
            padding: '60px 24px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, textTransform: 'uppercase', opacity: 0.3 }}>
              Runners still on course
            </div>
            <div className="mono" style={{ fontSize: 12, opacity: 0.4, marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Check back soon
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.map((r, i) => {
              const ms = startedAt ? new Date(r.finishedAt).getTime() - startedAt.getTime() : 0;
              const isLeader = i === 0;
              return (
                <div key={r._id} style={{
                  display: 'grid',
                  gridTemplateColumns: '56px 1fr auto',
                  alignItems: 'center',
                  gap: 16,
                  padding: '18px 20px',
                  border: `2px solid ${isLeader ? 'var(--punch)' : 'var(--rule)'}`,
                  borderRadius: 14,
                  background: isLeader ? 'color-mix(in oklab, var(--punch), transparent 88%)' : 'var(--card)',
                }}>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: i < 3 ? 30 : 22, textAlign: 'center', lineHeight: 1 }}>
                    {i < 3 ? MEDALS[i] : `#${i + 1}`}
                  </div>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, textTransform: 'uppercase', letterSpacing: '0.01em' }}>
                    {r.name}
                  </div>
                  <div style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 600,
                    color: isLeader ? 'var(--punch)' : 'var(--ink)',
                    letterSpacing: '0.04em', whiteSpace: 'nowrap',
                  }}>
                    {formatElapsed(ms)}
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

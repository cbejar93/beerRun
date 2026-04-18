import { useRef } from 'react';
import { Link } from 'react-router-dom';

export default function Nav({ role, setRole, isHost, onHostClick }) {
  const clicksRef = useRef(0);
  const timerRef = useRef(null);

  const handleBrandClick = () => {
    clicksRef.current += 1;
    clearTimeout(timerRef.current);
    if (clicksRef.current >= 3) {
      clicksRef.current = 0;
      onHostClick?.();
    } else {
      timerRef.current = setTimeout(() => { clicksRef.current = 0; }, 1500);
    }
  };

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link className="brand" to="/" onClick={handleBrandClick}>
          <div className="brand-mark">3</div>
          <span>Beer Run · '26</span>
        </Link>
        <div className="role-toggle" role="tablist">
          <button
            className={role === 'guest' ? 'active' : ''}
            onClick={() => setRole('guest')}
          >
            Guest
          </button>
          {isHost && (
            <button
              className={role === 'host' ? 'active' : ''}
              onClick={() => setRole('host')}
            >
              Host
            </button>
          )}
        </div>
        <div className="nav-meta mono" style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span><span className="dot" />LIVE · 36 DAYS OUT</span>
          <Link
            to="/preview"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--ink)',
              textDecoration: 'none',
              border: '1.5px solid var(--rule)',
              padding: '5px 10px',
              borderRadius: 999,
              opacity: 0.7,
            }}
          >
            Mobile Preview →
          </Link>
        </div>
      </div>
    </nav>
  );
}

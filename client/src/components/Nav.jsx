import { useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { EVENT_DATE } from '../data/constants';

export default function Nav({ role, setRole, isHost, onHostClick }) {
  const clicksRef = useRef(0);
  const timerRef = useRef(null);
  const daysOut = useMemo(() => Math.ceil((EVENT_DATE - new Date()) / (1000 * 60 * 60 * 24)), []);

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
        {isHost && (
          <div className="role-toggle" role="tablist">
            <button
              className={role === 'guest' ? 'active' : ''}
              onClick={() => setRole('guest')}
            >
              Guest
            </button>
            <button
              className={role === 'host' ? 'active' : ''}
              onClick={() => setRole('host')}
            >
              Host
            </button>
          </div>
        )}
        <div className="nav-meta mono">
          <Link to="/results" style={{ color: 'var(--ink)', textDecoration: 'none', opacity: 0.7 }}>
            Results
          </Link>
          <span><span className="dot" />LIVE · {daysOut} DAYS OUT</span>
        </div>
      </div>
    </nav>
  );
}

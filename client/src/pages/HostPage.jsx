import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';
import HostView from '../components/HostView';
import HostPinModal from '../components/HostPinModal';
import { useAuth } from '../hooks/useAuth';
import { useRsvps } from '../hooks/useRsvps';

export default function HostPage() {
  const { isHost, login, authFetch } = useAuth();
  const { apiRsvps, refresh } = useRsvps();
  const [pinModalOpen, setPinModalOpen] = useState(!isHost);
  const navigate = useNavigate();

  const handlePinSuccess = (token) => {
    login(token);
    setPinModalOpen(false);
  };

  const handleSetRole = (r) => {
    if (r === 'guest') navigate('/');
  };

  return (
    <>
      <Nav role="host" setRole={handleSetRole} isHost={isHost} onHostClick={() => setPinModalOpen(true)} />
      {isHost ? (
        <HostView apiRsvps={apiRsvps} onImport={refresh} authFetch={authFetch} />
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', textAlign: 'center' }}>
          <div>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, textTransform: 'uppercase', opacity: 0.3, marginBottom: 24 }}>
              Host access required
            </div>
            <button
              onClick={() => setPinModalOpen(true)}
              style={{
                padding: '14px 32px', background: 'var(--stout)', color: 'var(--paper)',
                border: 'none', borderRadius: 12, fontFamily: "'Anton', sans-serif",
                fontSize: 22, textTransform: 'uppercase', cursor: 'pointer', letterSpacing: '0.04em',
              }}
            >
              Enter PIN
            </button>
          </div>
        </div>
      )}
      {pinModalOpen && !isHost && (
        <HostPinModal onSuccess={handlePinSuccess} onClose={() => setPinModalOpen(false)} />
      )}
      <footer className="foot">
        <span>© 2026 BEER RUN PLANNING COMMISSION · OAKLAND CA</span>
        <span>CHUG RESPONSIBLY · RUN WITH FRIENDS</span>
        <span>MADE WITH SWEAT · MOSTLY</span>
      </footer>
    </>
  );
}

import { useState, useEffect } from 'react';
import Nav from '../components/Nav';
import Hero from '../components/Hero';
import Ticker from '../components/Ticker';
import RSVP from '../components/RSVP';
// import RouteMap from '../components/RouteMap';
import Runners from '../components/Runners';
import HostView from '../components/HostView';
import TweaksPanel from '../components/TweaksPanel';
import HostPinModal from '../components/HostPinModal';
import { useRsvps } from '../hooks/useRsvps';
import { useAuth } from '../hooks/useAuth';

export default function BeerRunApp() {
  const [role, setRole] = useState('guest');
  const [theme, setThemeState] = useState('amber');
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [liveRsvp, setLiveRsvp] = useState(null);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const { apiRsvps, addRsvp, refresh } = useRsvps();
  const { isHost, hostToken, login, logout, authFetch } = useAuth();

  const setTheme = (t) => {
    setThemeState(t);
    document.documentElement.setAttribute('data-theme', t);
  };

  const handleRsvp = (entry) => {
    setLiveRsvp(entry);
    addRsvp(entry);
  };

  const handleHostClick = () => {
    if (isHost) {
      setRole('host');
    } else {
      setPinModalOpen(true);
    }
  };

  const handlePinSuccess = (token) => {
    login(token);
    setPinModalOpen(false);
    setRole('host');
  };

  const handleSetRole = (r) => {
    if (r === 'guest' && role === 'host') {
      logout();
    }
    setRole(r);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'amber');
    const onMsg = (e) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, []);

  // If token expires or is cleared, drop back to guest
  useEffect(() => {
    if (!isHost && role === 'host') setRole('guest');
  }, [isHost, role]);

  return (
    <>
      <Nav role={role} setRole={handleSetRole} isHost={isHost} onHostClick={handleHostClick} />
      {role === 'guest' ? (
        <>
          <Hero />
          <Ticker />
          <RSVP onRsvp={handleRsvp} rsvpStatus={liveRsvp?.status} apiRsvps={apiRsvps} />
          {/* <RouteMap /> */}
          <Runners apiRsvps={apiRsvps} />
        </>
      ) : (
        <HostView apiRsvps={apiRsvps} onImport={refresh} authFetch={authFetch} />
      )}
      <footer className="foot">
        <span>© 2026 BEER RUN SOCIETY · OAKLAND CA</span>
        <span>CHUG RESPONSIBLY · RUN WITH FRIENDS</span>
        <span>MADE WITH SWEAT · MOSTLY</span>
      </footer>
      <TweaksPanel open={tweaksOpen} theme={theme} setTheme={setTheme} />
      {pinModalOpen && (
        <HostPinModal
          onSuccess={handlePinSuccess}
          onClose={() => setPinModalOpen(false)}
        />
      )}
    </>
  );
}

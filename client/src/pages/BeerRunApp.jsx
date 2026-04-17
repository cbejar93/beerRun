import { useState, useEffect } from 'react';
import Nav from '../components/Nav';
import Hero from '../components/Hero';
import Ticker from '../components/Ticker';
import RSVP from '../components/RSVP';
import RouteMap from '../components/RouteMap';
import Runners from '../components/Runners';
import HostView from '../components/HostView';
import TweaksPanel from '../components/TweaksPanel';

export default function BeerRunApp() {
  const [role, setRole] = useState('guest');
  const [theme, setThemeState] = useState('amber');
  const [tweaksOpen, setTweaksOpen] = useState(false);
  const [liveRsvp, setLiveRsvp] = useState(null);

  const setTheme = (t) => {
    setThemeState(t);
    document.documentElement.setAttribute('data-theme', t);
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

  return (
    <>
      <Nav role={role} setRole={setRole} />
      {role === 'guest' ? (
        <>
          <Hero />
          <Ticker />
          <RSVP onRsvp={setLiveRsvp} rsvpStatus={liveRsvp?.status} />
          <RouteMap />
          <Runners liveRsvp={liveRsvp} />
        </>
      ) : (
        <HostView liveRsvp={liveRsvp} />
      )}
      <footer className="foot">
        <span>© 2026 BEER RUN SOCIETY · OAKLAND CA</span>
        <span>CHUG RESPONSIBLY · RUN WITH FRIENDS</span>
        <span>MADE WITH SWEAT · MOSTLY</span>
      </footer>
      <TweaksPanel open={tweaksOpen} theme={theme} setTheme={setTheme} />
    </>
  );
}

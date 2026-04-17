import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import IOSDevice from '../components/IOSDevice';
import Hero from '../components/Hero';
import Ticker from '../components/Ticker';
import RSVP from '../components/RSVP';
import RouteMap from '../components/RouteMap';
import Runners from '../components/Runners';
import '../styles/styles.css';

const styles = {
  body: {
    margin: 0,
    padding: '48px 24px',
    background: '#2a2420',
    backgroundImage: 'radial-gradient(circle at 20% 10%, #3a2e26 0%, transparent 50%), radial-gradient(circle at 80% 90%, #1a1410 0%, transparent 50%)',
    minHeight: '100vh',
    fontFamily: "'Inter', system-ui, sans-serif",
    color: '#F5ECD7',
  },
  header: {
    maxWidth: 1200,
    margin: '0 auto 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 24,
    flexWrap: 'wrap',
  },
  h1: {
    fontFamily: "'Anton', sans-serif",
    fontSize: 56,
    lineHeight: 1,
    margin: 0,
    textTransform: 'uppercase',
    letterSpacing: '-0.01em',
  },
  sub: {
    margin: '8px 0 0',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12,
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  phones: {
    maxWidth: 1400,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: 40,
    justifyItems: 'center',
  },
  phoneCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
  },
  caption: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    opacity: 0.7,
    textAlign: 'center',
  },
  captionTitle: {
    display: 'block',
    fontFamily: "'Anton', sans-serif",
    fontSize: 22,
    letterSpacing: '0.02em',
    color: '#F5ECD7',
    marginBottom: 2,
    opacity: 1,
  },
};

function PhonePreview({ title, caption, children, scrollTo = 0 }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current && scrollTo > 0) {
      scrollRef.current.scrollTop = scrollTo;
    }
  }, [scrollTo]);

  return (
    <div style={styles.phoneCell}>
      <div style={styles.caption}>
        <strong style={styles.captionTitle}>{title}</strong>
        {caption}
      </div>
      <IOSDevice width={390} height={780}>
        <div
          ref={scrollRef}
          style={{ height: '100%', overflow: 'auto', background: '#F5ECD7' }}
          data-theme="amber"
        >
          {children}
        </div>
      </IOSDevice>
    </div>
  );
}

function AppContent() {
  return (
    <div data-theme="amber">
      <Hero />
      <Ticker />
      <RSVP />
      <RouteMap />
      <Runners />
      <footer className="foot">
        <span>© 2026 BEER RUN SOCIETY · OAKLAND CA</span>
        <span>CHUG RESPONSIBLY · RUN WITH FRIENDS</span>
      </footer>
    </div>
  );
}

export default function MobilePreview() {
  return (
    <div style={styles.body}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.h1}>Mobile Preview</h1>
          <p style={styles.sub}>Three scroll positions · 390×780 · iPhone 16-ish</p>
        </div>
        <Link
          to="/"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#C8F03C',
            textDecoration: 'none',
            border: '1.5px solid #C8F03C',
            padding: '8px 14px',
            borderRadius: 999,
          }}
        >
          ← Back to desktop
        </Link>
      </div>
      <div style={styles.phones}>
        <PhonePreview title="Hero" caption="Countdown stacks under headline" scrollTo={0}>
          <AppContent />
        </PhonePreview>
        <PhonePreview title="RSVP" caption="Pills stack vertically" scrollTo={820}>
          <AppContent />
        </PhonePreview>
        <PhonePreview title="Route" caption="Map + stops in a single column" scrollTo={1700}>
          <AppContent />
        </PhonePreview>
      </div>
    </div>
  );
}

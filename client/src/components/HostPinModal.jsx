import { useState, useRef, useEffect } from 'react';

export default function HostPinModal({ onSuccess, onClose }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!pin.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/host', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Wrong PIN');
        setShake(true);
        setTimeout(() => setShake(false), 600);
        setPin('');
        inputRef.current?.focus();
      } else {
        onSuccess(data.token);
      }
    } catch {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          background: 'var(--stout)', color: 'var(--paper)',
          borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 380,
          animation: shake ? 'shake 0.5s ease' : 'none',
        }}
      >
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.6, marginBottom: 8 }}>
          H.00 / ACCESS CONTROL
        </div>
        <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 32, textTransform: 'uppercase', margin: '0 0 8px', letterSpacing: '0.02em' }}>
          Host Only
        </h2>
        <p style={{ fontSize: 13, opacity: 0.7, margin: '0 0 28px', lineHeight: 1.5 }}>
          Enter the organizer PIN to access the control room.
        </p>
        <form onSubmit={submit}>
          <input
            ref={inputRef}
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            placeholder="PIN"
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 10,
              border: error ? '2px solid #ff4d4d' : '2px solid transparent',
              background: 'rgba(255,255,255,0.1)', color: 'var(--paper)',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 18,
              letterSpacing: '0.2em', boxSizing: 'border-box',
              outline: 'none',
            }}
          />
          {error && (
            <div style={{ marginTop: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#ff7070', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              ⚠ {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 20, width: '100%', padding: '14px',
              background: 'var(--punch)', color: 'var(--paper)',
              border: 'none', borderRadius: 10,
              fontFamily: "'Anton', sans-serif", fontSize: 20,
              textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.02em', opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Checking…' : 'Unlock →'}
          </button>
        </form>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}

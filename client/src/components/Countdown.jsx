import { useState, useEffect, useRef } from 'react';
import { EVENT_DATE } from '../data/constants';

function useCountdown(target) {
  const [tick, setTick] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - tick);
  return {
    days: Math.floor(diff / 86400000),
    hrs: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
  };
}

function CountdownCell({ value, unit }) {
  const [animKey, setAnimKey] = useState(0);
  const prevRef = useRef(value);
  useEffect(() => {
    if (prevRef.current !== value) {
      setAnimKey(k => k + 1);
      prevRef.current = value;
    }
  }, [value]);
  return (
    <div className="cd-cell">
      <span className="cd-num cd-flip" key={animKey}>
        {String(value).padStart(2, '0')}
      </span>
      <span className="cd-unit">{unit}</span>
    </div>
  );
}

export default function Countdown() {
  const { days, hrs, mins, secs } = useCountdown(EVENT_DATE);
  return (
    <div className="countdown-card">
      <div className="label">
        <span>T-Minus until gun goes off</span>
        <span className="mono" style={{ opacity: 0.8 }}>MAY 23 · 11:00</span>
      </div>
      <div className="countdown-grid">
        <CountdownCell value={days} unit="Days" />
        <CountdownCell value={hrs} unit="Hours" />
        <CountdownCell value={mins} unit="Min" />
        <CountdownCell value={secs} unit="Sec" />
      </div>
    </div>
  );
}

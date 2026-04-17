import { useState, useEffect } from 'react';

export function useRsvps() {
  const [apiRsvps, setApiRsvps] = useState([]);

  useEffect(() => {
    fetch('/api/rsvp')
      .then(r => r.json())
      .then(data => setApiRsvps(data.entries ?? []))
      .catch(() => {});
  }, []);

  const addRsvp = (entry) => setApiRsvps(prev => [entry, ...prev]);

  return { apiRsvps, addRsvp };
}

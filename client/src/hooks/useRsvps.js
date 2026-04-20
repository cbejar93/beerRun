import { useState, useEffect, useCallback } from 'react';

export function useRsvps() {
  const [apiRsvps, setApiRsvps] = useState([]);

  const fetchRsvps = useCallback(() => {
    fetch('/api/rsvp')
      .then(r => r.json())
      .then(data => setApiRsvps(data.entries ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => { fetchRsvps(); }, [fetchRsvps]);

  return { apiRsvps, refresh: fetchRsvps };
}

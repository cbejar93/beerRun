const GOING_FALLBACKS = ['No notes, just vibes', 'Confirmed and Toxic'];

const DEFAULT_NOTE = {
  going: (name) => GOING_FALLBACKS[name.charCodeAt(0) % GOING_FALLBACKS.length],
  maybe: 'Keeping options open',
  out:   'Cheering from the couch',
};

export function mergeRsvps(apiRsvps) {
  return apiRsvps.map(r => ({
    _id: r._id,
    name: r.name,
    pace: '',
    status: r.status,
    note: r.beer || (typeof DEFAULT_NOTE[r.status] === 'function'
      ? DEFAULT_NOTE[r.status](r.name)
      : DEFAULT_NOTE[r.status]) || 'Freshly RSVPed',
  }));
}

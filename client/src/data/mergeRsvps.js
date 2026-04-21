const DEFAULT_NOTE = {
  going: 'Freshly RSVPed',
  maybe: 'Keeping options open',
  out:   'Cheering from the couch',
};

export function mergeRsvps(apiRsvps) {
  return apiRsvps.map(r => ({
    _id: r._id,
    name: r.name,
    pace: '',
    status: r.status,
    note: r.beer || DEFAULT_NOTE[r.status] || 'Freshly RSVPed',
  }));
}

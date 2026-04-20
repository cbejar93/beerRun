export function mergeRsvps(apiRsvps) {
  return apiRsvps.map(r => ({
    _id: r._id,
    name: r.name,
    pace: '',
    status: r.status,
    note: r.beer || 'Freshly RSVPed',
  }));
}

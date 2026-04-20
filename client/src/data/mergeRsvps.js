import { RUNNERS } from './constants';

export function mergeRsvps(apiRsvps) {
  const apiMapped = apiRsvps.map(r => ({
    _id: r._id,
    name: r.name,
    pace: 'Rookie',
    status: r.status,
    note: r.beer || 'Freshly RSVPed',
  }));
  const apiNames = new Set(apiMapped.map(r => r.name.toLowerCase()));
  return [...apiMapped, ...RUNNERS.filter(r => !apiNames.has(r.name.toLowerCase()))];
}

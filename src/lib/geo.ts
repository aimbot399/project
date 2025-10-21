
import type { DestinationWithNotes } from '../types';

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = deg2rad(b.lat - a.lat);
  const dLon = deg2rad(b.lng - a.lng);
  const lat1 = deg2rad(a.lat);
  const lat2 = deg2rad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function deg2rad(d: number) {
  return (d * Math.PI) / 180;
}

export function getTotalDistanceKm(destinations: DestinationWithNotes[]) {
  if (destinations.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < destinations.length; i++) {
    sum += haversineKm(
      { lat: destinations[i - 1].latitude, lng: destinations[i - 1].longitude },
      { lat: destinations[i].latitude, lng: destinations[i].longitude }
    );
  }
  return sum;
}

export function getCountriesVisited(destinations: DestinationWithNotes[]) {
  // Placeholder: group by first word after comma (best-effort without reverse geocoding all)
  const map = new Map<string, number>();
  for (const d of destinations) {
    const parts = d.name.split(',').map((s) => s.trim());
    const country = parts[parts.length - 1] || 'Unknown';
    map.set(country, (map.get(country) || 0) + 1);
  }
  const breakdown = Array.from(map.entries()).map(([country, count]) => ({ country, count }));
  return { countriesCount: breakdown.length, countriesBreakdown: breakdown };
}



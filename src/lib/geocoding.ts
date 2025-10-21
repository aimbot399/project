export type ReverseGeocodeResult = {
  city?: string;
  state?: string;
  country?: string;
  formatted: string;
};

export async function reverseGeocodeCityStateCountry(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=10&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'JourneyMap/1.0 (demo)'
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data.address || {};
    const city: string | undefined = addr.city || addr.town || addr.village || addr.hamlet;
    const state: string | undefined = addr.state || addr.region || addr.county;
    const country: string | undefined = addr.country;
    const parts = [city, state, country].filter(Boolean) as string[];
    return {
      city,
      state,
      country,
      formatted: parts.join(', '),
    };
  } catch (e) {
    console.error('reverseGeocodeCityStateCountry error', e);
    return null;
  }
}



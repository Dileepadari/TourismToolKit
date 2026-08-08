import type { Place } from '@/graphql/types';

/**
 * Where a place lives, as one line: "Jaipur, Rajasthan, India".
 */
export function placeLocation(place: Pick<Place, 'city' | 'state' | 'country'>): string {
  return [place.city, place.state, place.country].filter(Boolean).join(', ');
}

/**
 * A maps link for a place.
 *
 * Coordinates are preferred because they are unambiguous, but many seeded rows
 * have none - so fall back to a name+location search rather than rendering a
 * control that cannot do anything, which is what the directions button was.
 */
export function placeMapUrl(place: Place): string {
  if (typeof place.latitude === 'number' && typeof place.longitude === 'number') {
    return `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
  }
  const query = encodeURIComponent(`${place.name}, ${placeLocation(place)}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/** The canonical, shareable URL for a place. */
export function placeUrl(placeId: number): string {
  return `/places/${placeId}`;
}

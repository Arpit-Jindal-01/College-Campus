// Geocoding Service - Uses OpenStreetMap Nominatim API (free, no API key required)

export interface GeocodingResult {
  city: string;
  country: string;
  displayName: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

// Reverse geocode coordinates to city/country using OpenStreetMap Nominatim
export async function reverseGeocode(coords: Coordinates): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'SkillPulse PWA',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding failed');
    }

    const data = await response.json();
    
    const address = data.address || {};
    const city = address.city || address.town || address.village || address.municipality || address.county || 'Unknown';
    const country = address.country || 'Unknown';

    return {
      city,
      country,
      displayName: data.display_name || `${city}, ${country}`,
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

// Get current position using browser geolocation API
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  });
}

// Combined function to get user's location
export async function getUserLocation(): Promise<{
  city: string;
  country: string;
  coordinates: Coordinates;
} | null> {
  try {
    const position = await getCurrentPosition();
    const coords: Coordinates = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };

    const geocodeResult = await reverseGeocode(coords);
    
    if (!geocodeResult) {
      return null;
    }

    return {
      city: geocodeResult.city,
      country: geocodeResult.country,
      coordinates: coords,
    };
  } catch (error) {
    console.error('Failed to get user location:', error);
    return null;
  }
}

// Search for cities (for manual input autocomplete)
export async function searchCities(query: string): Promise<GeocodingResult[]> {
  if (query.length < 2) return [];
  
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&featuretype=city`,
      {
        headers: {
          'User-Agent': 'SkillPulse PWA',
        },
      }
    );

    if (!response.ok) {
      throw new Error('City search failed');
    }

    const data = await response.json();
    
    return data.map((item: any) => ({
      city: item.address?.city || item.address?.town || item.address?.village || item.name,
      country: item.address?.country || '',
      displayName: item.display_name,
    }));
  } catch (error) {
    console.error('City search error:', error);
    return [];
  }
}

// Forward geocode a city/country string to coordinates
export async function forwardGeocode(city: string, country: string): Promise<Coordinates | null> {
  try {
    const query = `${city}, ${country}`;
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'SkillPulse PWA',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Forward geocoding failed');
    }

    const data = await response.json();
    
    if (data.length === 0) {
      return null;
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } catch (error) {
    console.error('Forward geocoding error:', error);
    return null;
  }
}

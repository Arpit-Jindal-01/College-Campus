import { useState, useCallback } from 'react';
import { reverseGeocode, forwardGeocode } from '@/services/geocodingService';

export interface LocationData {
  city: string;
  country: string;
  lat: number;
  lng: number;
}

const STORAGE_KEY = 'skillpulse_location';

export function useUserLocation() {
  const [location, setLocation] = useState<LocationData | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveLocation = useCallback((loc: LocationData) => {
    setLocation(loc);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const detectLocation = useCallback(async (): Promise<LocationData | null> => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return null;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000,
        });
      });

      const { latitude: lat, longitude: lng } = position.coords;

      // Use real reverse geocoding
      const geocodeResult = await reverseGeocode({ lat, lng });

      if (!geocodeResult) {
        setError('Could not determine your city. Please enter manually.');
        setIsLoading(false);
        return null;
      }

      const locationData: LocationData = {
        city: geocodeResult.city,
        country: geocodeResult.country,
        lat,
        lng,
      };

      saveLocation(locationData);
      setIsLoading(false);
      return locationData;
    } catch (err: any) {
      let errorMessage = 'Could not get your location';
      
      if (err.code === 1) {
        errorMessage = 'Location permission denied. Please enable it or enter manually.';
      } else if (err.code === 2) {
        errorMessage = 'Location unavailable. Please try again or enter manually.';
      } else if (err.code === 3) {
        errorMessage = 'Location request timed out. Please try again.';
      }

      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, [saveLocation]);

  // Set manual location with forward geocoding to get real coordinates
  const setManualLocation = useCallback(async (city: string, country: string): Promise<LocationData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Forward geocode to get real coordinates
      const coords = await forwardGeocode(city, country);
      
      if (!coords) {
        setError('Could not find that location. Please check spelling.');
        setIsLoading(false);
        return null;
      }

      const locationData: LocationData = {
        city,
        country,
        lat: coords.lat,
        lng: coords.lng,
      };
      
      saveLocation(locationData);
      setIsLoading(false);
      return locationData;
    } catch (err) {
      setError('Failed to geocode location. Please try again.');
      setIsLoading(false);
      return null;
    }
  }, [saveLocation]);

  return {
    location,
    isLoading,
    error,
    detectLocation,
    setManualLocation,
    clearLocation,
    saveLocation,
  };
}

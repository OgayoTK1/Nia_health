import { useState, useEffect } from 'react';

/**
 * Custom hook to get user's current geolocation
 * Uses browser's Geolocation API
 * 
 * @param {Object} options - Geolocation options
 * @returns {Object} Location data and helper functions
 */
const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true
  });

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false
      }));
      return;
    }

    const successHandler = (position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        error: null,
        loading: false
      });
    };

    const errorHandler = (error) => {
      let errorMessage = 'Unable to retrieve your location';
      
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable. Please check your device settings.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out. Please try again.';
          break;
        default:
          errorMessage = 'An unknown error occurred while getting your location.';
      }

      setLocation(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }));
    };

    // Get current position
    navigator.geolocation.getCurrentPosition(
      successHandler,
      errorHandler,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options
      }
    );
  }, []);

  /**
   * Refetch current location
   */
  const refetch = () => {
    setLocation(prev => ({ ...prev, loading: true, error: null }));
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false
        });
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Request timed out';
            break;
        }

        setLocation(prev => ({
          ...prev,
          error: errorMessage,
          loading: false
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return { ...location, refetch };
};

export default useGeolocation;

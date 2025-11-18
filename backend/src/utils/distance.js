/**
 * Geolocation Distance Utilities
 * Haversine formula for calculating distance between GPS coordinates
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers (rounded to 1 decimal)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Sort clinics by distance from user location
 * @param {Array} clinics - Array of clinic objects with latitude/longitude
 * @param {number} userLat - User's latitude
 * @param {number} userLon - User's longitude
 * @returns {Array} Clinics sorted by distance with distance property added
 */
const sortByDistance = (clinics, userLat, userLon) => {
  return clinics
    .map(clinic => ({
      ...clinic,
      distance: calculateDistance(userLat, userLon, clinic.latitude, clinic.longitude)
    }))
    .sort((a, b) => a.distance - b.distance);
};

/**
 * Filter clinics within a specific radius
 * @param {Array} clinics - Array of clinic objects with distance property
 * @param {number} maxRadius - Maximum distance in kilometers
 * @returns {Array} Filtered clinics
 */
const filterByRadius = (clinics, maxRadius) => {
  return clinics.filter(clinic => clinic.distance <= maxRadius);
};

/**
 * Get human-readable distance string
 * @param {number} distance - Distance in kilometers
 * @returns {string} Formatted distance string
 */
const formatDistance = (distance) => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }
  return `${distance.toFixed(1)} km`;
};

module.exports = {
  calculateDistance,
  sortByDistance,
  filterByRadius,
  formatDistance,
  toRadians
};

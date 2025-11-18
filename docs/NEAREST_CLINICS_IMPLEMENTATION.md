# 🗺️ Nearest Clinics/Hospitals Feature - Implementation Guide

## Overview
This guide covers implementing a geolocation-based "Find Nearest Clinics" feature for NiaHealth.

---

## 🎯 Implementation Options

### **Option 1: Coordinate-Based (Haversine Formula)** ⭐ RECOMMENDED
- **Pros:** Simple, no external API costs, works offline
- **Cons:** Requires manual coordinate entry for clinics
- **Best for:** Small to medium clinic networks (5-50 clinics)

### **Option 2: Google Maps API**
- **Pros:** Real-time data, autocomplete, directions
- **Cons:** Costs money after free tier, requires API key
- **Best for:** Production apps with budget

### **Option 3: OpenStreetMap + Leaflet**
- **Pros:** Free, open-source, good documentation
- **Cons:** Requires more setup than Google Maps
- **Best for:** Open-source projects

---

## 🚀 OPTION 1: Coordinate-Based Implementation (Recommended)

### Step 1: Database Migration - Add Coordinates to Clinics

```sql
-- Add latitude and longitude columns to clinics table
ALTER TABLE clinics 
ADD COLUMN latitude DECIMAL(10, 8) DEFAULT NULL AFTER location,
ADD COLUMN longitude DECIMAL(11, 8) DEFAULT NULL AFTER latitude;

-- Add spatial index for faster queries
ALTER TABLE clinics 
ADD INDEX idx_coordinates (latitude, longitude);

-- Update existing clinics with coordinates (Kenyan locations)
UPDATE clinics SET latitude = -1.286389, longitude = 36.817223 WHERE name = 'Nairobi Central Hospital';
UPDATE clinics SET latitude = -0.091702, longitude = 34.767956 WHERE name = 'Kisumu District Hospital';
UPDATE clinics SET latitude = -4.043477, longitude = 39.668206 WHERE name = 'Mombasa County Hospital';
UPDATE clinics SET latitude = 0.514277, longitude = 35.269779 WHERE name = 'Eldoret Regional Clinic';
UPDATE clinics SET latitude = -0.683297, longitude = 34.756205 WHERE name = 'Kakamega General Hospital';
```

### Step 2: Backend - Add Haversine Distance Function

**File:** `backend/src/utils/distance.js` (Create new file)

```javascript
/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
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

module.exports = {
  calculateDistance,
  sortByDistance
};
```

### Step 3: Backend - Add Nearest Clinics Endpoint

**File:** `backend/src/controllers/clinicController.js` (Add new function)

```javascript
const { sortByDistance } = require('../utils/distance');

// Get nearest clinics based on user location
const getNearestClinics = asyncHandler(async (req, res) => {
  const { latitude, longitude, radius = 50, limit = 10 } = req.query;

  // Validate coordinates
  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude are required'
    });
  }

  const userLat = parseFloat(latitude);
  const userLon = parseFloat(longitude);
  const maxRadius = parseFloat(radius); // in kilometers
  const maxLimit = parseInt(limit);

  if (isNaN(userLat) || isNaN(userLon)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid coordinates'
    });
  }

  // Get all active clinics with coordinates
  const [clinics] = await query(
    `SELECT id, name, location, contact, email, capacity, operating_hours,
            latitude, longitude, is_active
     FROM clinics 
     WHERE is_active = TRUE 
       AND latitude IS NOT NULL 
       AND longitude IS NOT NULL`
  );

  if (clinics.length === 0) {
    return res.json({
      success: true,
      message: 'No clinics found',
      data: {
        userLocation: { latitude: userLat, longitude: userLon },
        clinics: [],
        count: 0
      }
    });
  }

  // Calculate distances and sort
  let sortedClinics = sortByDistance(clinics, userLat, userLon);

  // Filter by radius if specified
  if (maxRadius) {
    sortedClinics = sortedClinics.filter(clinic => clinic.distance <= maxRadius);
  }

  // Limit results
  sortedClinics = sortedClinics.slice(0, maxLimit);

  res.json({
    success: true,
    message: `Found ${sortedClinics.length} clinic(s) near you`,
    data: {
      userLocation: { latitude: userLat, longitude: userLon },
      searchRadius: maxRadius,
      clinics: sortedClinics,
      count: sortedClinics.length
    }
  });
});

// Export at the bottom
module.exports = {
  // ... existing exports
  getNearestClinics
};
```

### Step 4: Backend - Add Route

**File:** `backend/src/routes/clinicRoutes.js`

```javascript
// Add this route (no authentication required for public search)
router.get('/nearest', clinicController.getNearestClinics);
```

### Step 5: Frontend - Create Location Hook

**File:** `frontend/src/hooks/useGeolocation.js` (Create new file)

```javascript
import { useState, useEffect } from 'react';

const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true
  });

  useEffect(() => {
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
          errorMessage = 'Location permission denied. Please enable location access.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out.';
          break;
        default:
          errorMessage = 'An unknown error occurred.';
      }

      setLocation(prev => ({
        ...prev,
        error: errorMessage,
        loading: false
      }));
    };

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

  const refetch = () => {
    setLocation(prev => ({ ...prev, loading: true }));
    
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
        setLocation(prev => ({
          ...prev,
          error: error.message,
          loading: false
        }));
      }
    );
  };

  return { ...location, refetch };
};

export default useGeolocation;
```

### Step 6: Frontend - Add API Function

**File:** `frontend/src/api/index.js`

```javascript
// Add to clinicAPI object
export const clinicAPI = {
  // ... existing methods
  
  getNearestClinics: (latitude, longitude, radius = 50, limit = 10) => 
    api.get(`/clinics/nearest`, {
      params: { latitude, longitude, radius, limit }
    })
};
```

### Step 7: Frontend - Create Nearest Clinics Component

**File:** `frontend/src/components/NearestClinics.jsx`

```javascript
import { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, Mail, Clock, Loader } from 'lucide-react';
import useGeolocation from '../hooks/useGeolocation';
import { clinicAPI } from '../api';

const NearestClinics = ({ onSelectClinic }) => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [radius, setRadius] = useState(50);
  
  const { latitude, longitude, error: geoError, loading: geoLoading, refetch } = useGeolocation();

  useEffect(() => {
    if (latitude && longitude) {
      fetchNearestClinics();
    }
  }, [latitude, longitude, radius]);

  const fetchNearestClinics = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await clinicAPI.getNearestClinics(latitude, longitude, radius);
      setClinics(response.data.data.clinics);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load nearby clinics');
    } finally {
      setLoading(false);
    }
  };

  if (geoLoading) {
    return (
      <div className="text-center py-8">
        <Loader className="w-8 h-8 animate-spin mx-auto text-primary-600" />
        <p className="mt-4 text-gray-600">Getting your location...</p>
      </div>
    );
  }

  if (geoError) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <MapPin className="w-12 h-12 mx-auto text-yellow-600 mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Access Needed</h3>
        <p className="text-gray-600 mb-4">{geoError}</p>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nearest Clinics</h2>
          <p className="text-sm text-gray-600">
            Your location: {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
          </p>
        </div>
        
        {/* Radius Filter */}
        <select
          value={radius}
          onChange={(e) => setRadius(parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value={10}>Within 10 km</option>
          <option value={25}>Within 25 km</option>
          <option value={50}>Within 50 km</option>
          <option value={100}>Within 100 km</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <Loader className="w-8 h-8 animate-spin mx-auto text-primary-600" />
        </div>
      )}

      {/* Clinics List */}
      {!loading && clinics.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">No clinics found within {radius} km</p>
        </div>
      )}

      {!loading && clinics.length > 0 && (
        <div className="grid gap-4">
          {clinics.map((clinic, index) => (
            <div
              key={clinic.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              {/* Distance Badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{clinic.name}</h3>
                    <p className="text-sm text-gray-600">{clinic.location}</p>
                  </div>
                </div>
                
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Navigation className="w-4 h-4" />
                  {clinic.distance} km
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{clinic.contact}</span>
                </div>
                {clinic.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{clinic.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{clinic.operating_hours}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => onSelectClinic && onSelectClinic(clinic)}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
                >
                  Book Appointment
                </button>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${clinic.latitude},${clinic.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Directions
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NearestClinics;
```

### Step 8: Integration - Add to Dashboard or New Page

**File:** `frontend/src/pages/NearestClinicsPage.jsx`

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import NearestClinics from '../components/NearestClinics';
import AppointmentForm from '../components/AppointmentForm';
import Toast from '../components/Toast';

const NearestClinicsPage = () => {
  const navigate = useNavigate();
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSelectClinic = (clinic) => {
    setSelectedClinic(clinic);
    setShowAppointmentForm(true);
  };

  const handleAppointmentSubmit = async (formData) => {
    // Handle appointment booking
    // (Your existing appointment booking logic)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NearestClinics onSelectClinic={handleSelectClinic} />
      </div>

      {/* Appointment Form Modal */}
      {showAppointmentForm && (
        <AppointmentForm
          isOpen={showAppointmentForm}
          onClose={() => setShowAppointmentForm(false)}
          onSubmit={handleAppointmentSubmit}
          clinics={selectedClinic ? [selectedClinic] : []}
        />
      )}

      {/* Toast Notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default NearestClinicsPage;
```

### Step 9: Add Route

**File:** `frontend/src/App.jsx`

```javascript
import NearestClinicsPage from './pages/NearestClinicsPage';

// Add route
<Route path="/nearest-clinics" element={<NearestClinicsPage />} />
```

---

## 📊 Testing

### Test Coordinates (Kenya)

```javascript
// Nairobi City Center
latitude: -1.286389
longitude: 36.817223

// Kisumu
latitude: -0.091702
longitude: 34.767956

// Mombasa
latitude: -4.043477
longitude: 39.668206
```

### Test API Call (Backend running)

```bash
curl "http://localhost:5000/api/clinics/nearest?latitude=-1.286389&longitude=36.817223&radius=50&limit=5"
```

---

## 🎨 UI Enhancements (Optional)

1. **Map Integration** - Add interactive map using Leaflet
2. **Search Box** - Allow manual location entry
3. **Filters** - Filter by services, availability, capacity
4. **Save Favorites** - Let users save preferred clinics
5. **Reviews** - Add clinic ratings and reviews

---

## 📝 Summary

✅ **Simple to implement** - No external API required  
✅ **Fast** - Calculates distances in milliseconds  
✅ **Accurate** - Haversine formula gives precise distances  
✅ **Mobile-friendly** - Uses device GPS automatically  
✅ **Offline-capable** - Works without constant internet  

**Next Steps:**
1. Run database migration to add coordinates
2. Create backend utility functions
3. Add API endpoint
4. Build frontend components
5. Test with real coordinates
6. Deploy and monitor usage

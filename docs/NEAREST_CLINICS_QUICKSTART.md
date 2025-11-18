# 🚀 Quick Start - Nearest Clinics Feature

## Prerequisites
- ✅ Backend running on port 5000
- ✅ Frontend running on port 5173
- ✅ MySQL database accessible

---

## Step-by-Step Setup (5 minutes)

### 1️⃣ **Database Migration** (2 minutes)

Run the migration to add latitude/longitude to clinics:

```bash
docker exec -it niahealth-mysql mysql -uroot -proot -D niahealth < docs/migrations/add_clinic_coordinates.sql
```

Or manually:

```bash
docker exec -it niahealth-mysql mysql -uroot -proot -D niahealth
```

Then paste:

```sql
ALTER TABLE clinics 
ADD COLUMN latitude DECIMAL(10, 8) DEFAULT NULL AFTER location,
ADD COLUMN longitude DECIMAL(11, 8) DEFAULT NULL AFTER latitude;

-- Add index
ALTER TABLE clinics ADD INDEX idx_coordinates (latitude, longitude);

-- Update with sample coordinates
UPDATE clinics SET latitude = -1.286389, longitude = 36.817223 WHERE id = 1;
UPDATE clinics SET latitude = -0.091702, longitude = 34.767956 WHERE id = 2;
UPDATE clinics SET latitude = -4.043477, longitude = 39.668206 WHERE id = 3;
UPDATE clinics SET latitude = 0.514277, longitude = 35.269779 WHERE id = 4;
UPDATE clinics SET latitude = -0.283215, longitude = 34.752014 WHERE id = 5;

-- Verify
SELECT id, name, latitude, longitude FROM clinics;
```

### 2️⃣ **Backend Controller** (1 minute)

Add to `backend/src/controllers/clinicController.js`:

```javascript
const { sortByDistance } = require('../utils/distance');
const { asyncHandler } = require('../middleware/errorHandler');

// Get nearest clinics
const getNearestClinics = asyncHandler(async (req, res) => {
  const { latitude, longitude, radius = 50, limit = 10 } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude are required'
    });
  }

  const userLat = parseFloat(latitude);
  const userLon = parseFloat(longitude);
  const maxRadius = parseFloat(radius);
  const maxLimit = parseInt(limit);

  // Get active clinics with coordinates
  const [clinics] = await query(
    `SELECT id, name, location, contact, email, capacity, operating_hours,
            latitude, longitude
     FROM clinics 
     WHERE is_active = TRUE 
       AND latitude IS NOT NULL 
       AND longitude IS NOT NULL`
  );

  if (clinics.length === 0) {
    return res.json({
      success: true,
      message: 'No clinics found',
      data: { clinics: [], count: 0 }
    });
  }

  // Calculate distances and sort
  let sortedClinics = sortByDistance(clinics, userLat, userLon);

  // Filter by radius
  if (maxRadius) {
    sortedClinics = sortedClinics.filter(c => c.distance <= maxRadius);
  }

  // Limit results
  sortedClinics = sortedClinics.slice(0, maxLimit);

  res.json({
    success: true,
    message: `Found ${sortedClinics.length} clinic(s)`,
    data: {
      userLocation: { latitude: userLat, longitude: userLon },
      searchRadius: maxRadius,
      clinics: sortedClinics,
      count: sortedClinics.length
    }
  });
});

// Add to exports
module.exports = {
  getAllClinics,
  getClinicById,
  createClinic,
  updateClinic,
  deleteClinic,
  getNearestClinics  // ← ADD THIS
};
```

### 3️⃣ **Backend Route** (30 seconds)

Add to `backend/src/routes/clinicRoutes.js`:

```javascript
// Add BEFORE the /:id route (order matters!)
router.get('/nearest', clinicController.getNearestClinics);
```

### 4️⃣ **Test Backend** (30 seconds)

```bash
# Test with Nairobi coordinates
curl "http://localhost:5000/api/clinics/nearest?latitude=-1.286389&longitude=36.817223&radius=50&limit=5"
```

Expected response:

```json
{
  "success": true,
  "message": "Found 5 clinic(s)",
  "data": {
    "userLocation": { "latitude": -1.286389, "longitude": 36.817223 },
    "searchRadius": 50,
    "clinics": [
      {
        "id": 1,
        "name": "Nairobi Central Hospital",
        "distance": 0.0,
        "latitude": -1.286389,
        "longitude": 36.817223
      }
    ],
    "count": 5
  }
}
```

### 5️⃣ **Frontend API** (30 seconds)

Add to `frontend/src/api/index.js`:

```javascript
export const clinicAPI = {
  // ... existing methods
  
  getNearestClinics: (latitude, longitude, radius = 50, limit = 10) => 
    api.get(`/clinics/nearest`, {
      params: { latitude, longitude, radius, limit }
    })
};
```

### 6️⃣ **Test in Browser** (1 minute)

Open browser console and test:

```javascript
// Get your location
navigator.geolocation.getCurrentPosition(
  (pos) => {
    console.log('Your location:', pos.coords.latitude, pos.coords.longitude);
    
    // Test API
    fetch(`http://localhost:5000/api/clinics/nearest?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&radius=50`)
      .then(r => r.json())
      .then(data => console.log('Nearest clinics:', data));
  },
  (error) => console.error('Location error:', error)
);
```

---

## 🎨 Quick UI Component (Optional)

Create `frontend/src/pages/FindClinicsPage.jsx`:

```javascript
import { useState } from 'react';
import useGeolocation from '../hooks/useGeolocation';
import { clinicAPI } from '../api';

const FindClinicsPage = () => {
  const { latitude, longitude, loading, error } = useGeolocation();
  const [clinics, setClinics] = useState([]);

  const searchNearby = async () => {
    const response = await clinicAPI.getNearestClinics(latitude, longitude);
    setClinics(response.data.data.clinics);
  };

  if (loading) return <div>Getting your location...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Find Nearest Clinics</h1>
      <p>Your location: {latitude}, {longitude}</p>
      
      <button 
        onClick={searchNearby}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
      >
        Search Nearby Clinics
      </button>

      <div className="mt-8 space-y-4">
        {clinics.map(clinic => (
          <div key={clinic.id} className="border p-4 rounded">
            <h3 className="font-bold">{clinic.name}</h3>
            <p className="text-gray-600">{clinic.location}</p>
            <p className="text-green-600 font-semibold">{clinic.distance} km away</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FindClinicsPage;
```

Add route in `App.jsx`:

```javascript
<Route path="/find-clinics" element={<FindClinicsPage />} />
```

---

## 🧪 Testing Checklist

- [ ] Database has latitude/longitude columns
- [ ] At least 3 clinics have coordinates
- [ ] Backend API responds to `/api/clinics/nearest`
- [ ] Browser can access user's location
- [ ] Frontend displays distance correctly
- [ ] Sorting by distance works
- [ ] Radius filter works

---

## 📍 Finding Real Coordinates

### Method 1: Google Maps
1. Open Google Maps
2. Right-click on clinic location
3. Click first option (coordinates)
4. Copy latitude, longitude

### Method 2: GPS App
- Use any GPS app on your phone
- Visit the clinic
- Record coordinates

### Method 3: Online Tools
- https://www.latlong.net/
- Search for address
- Copy coordinates

---

## 🐛 Troubleshooting

### "No clinics found"
→ Check if clinics have coordinates in database

### "Location permission denied"
→ Enable location in browser settings (usually a button in URL bar)

### "401 Unauthorized"
→ Make sure route is BEFORE authenticate middleware

### Wrong distances
→ Verify latitude/longitude are not swapped (lat should be around -1 to 1 for Kenya)

---

## 🎯 Next Steps

1. ✅ **Get it working** - Follow steps 1-6 above
2. 🎨 **Add UI** - Build the full component from NEAREST_CLINICS_IMPLEMENTATION.md
3. 🗺️ **Add map** - Integrate Leaflet or Google Maps
4. 🔍 **Add filters** - Services, hours, capacity
5. ⭐ **Add ratings** - Let users rate clinics

---

## 📚 Full Documentation

See `NEAREST_CLINICS_IMPLEMENTATION.md` for complete implementation guide with full components.

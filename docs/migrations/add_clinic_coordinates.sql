-- Migration: Add Geolocation Support to Clinics
-- Date: November 17, 2025
-- Purpose: Enable "Find Nearest Clinics" feature

USE niahealth;

-- Step 1: Add latitude and longitude columns
ALTER TABLE clinics 
ADD COLUMN latitude DECIMAL(10, 8) DEFAULT NULL AFTER location,
ADD COLUMN longitude DECIMAL(11, 8) DEFAULT NULL AFTER latitude;

-- Step 2: Add spatial index for faster distance queries
ALTER TABLE clinics 
ADD INDEX idx_coordinates (latitude, longitude);

-- Step 3: Update existing clinics with sample Kenyan coordinates
-- Note: Replace these with real coordinates of your clinics

-- Nairobi clinics
UPDATE clinics SET 
  latitude = -1.286389, 
  longitude = 36.817223 
WHERE name LIKE '%Nairobi%' AND latitude IS NULL;

-- Kisumu clinics
UPDATE clinics SET 
  latitude = -0.091702, 
  longitude = 34.767956 
WHERE name LIKE '%Kisumu%' AND latitude IS NULL;

-- Mombasa clinics
UPDATE clinics SET 
  latitude = -4.043477, 
  longitude = 39.668206 
WHERE name LIKE '%Mombasa%' AND latitude IS NULL;

-- Eldoret clinics
UPDATE clinics SET 
  latitude = 0.514277, 
  longitude = 35.269779 
WHERE name LIKE '%Eldoret%' AND latitude IS NULL;

-- Kakamega clinics
UPDATE clinics SET 
  latitude = -0.283215, 
  longitude = 34.752014 
WHERE name LIKE '%Kakamega%' AND latitude IS NULL;

-- Nakuru clinics
UPDATE clinics SET 
  latitude = -0.303099, 
  longitude = 36.080026 
WHERE name LIKE '%Nakuru%' AND latitude IS NULL;

-- Thika clinics
UPDATE clinics SET 
  latitude = -1.033361, 
  longitude = 37.069328 
WHERE name LIKE '%Thika%' AND latitude IS NULL;

-- Machakos clinics
UPDATE clinics SET 
  latitude = -1.517417, 
  longitude = 37.263428 
WHERE name LIKE '%Machakos%' AND latitude IS NULL;

-- Step 4: Verify the changes
SELECT 
  id,
  name,
  location,
  latitude,
  longitude,
  CASE 
    WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 'YES'
    ELSE 'NO'
  END AS has_coordinates
FROM clinics
ORDER BY name;

-- Step 5: Show clinics without coordinates (need manual update)
SELECT 
  id,
  name,
  location,
  'NEEDS COORDINATES' AS status
FROM clinics
WHERE latitude IS NULL OR longitude IS NULL;

-- Rollback script (if needed)
-- ALTER TABLE clinics DROP COLUMN latitude;
-- ALTER TABLE clinics DROP COLUMN longitude;
-- ALTER TABLE clinics DROP INDEX idx_coordinates;

# Backend Location Integration - Complete Implementation Guide

## Overview
This document describes the complete backend-to-frontend location tracking integration for the SuCAR platform, enabling real-time location updates, queue management, and ETA calculations.

## Database Schema

### New Tables

#### `location_tracking`
Stores real-time location updates for drivers and bookings:
- `id` (UUID) - Primary key
- `user_id` (UUID) - References users (driver)
- `booking_id` (UUID) - References bookings (optional)
- `coordinates` (JSONB) - {lat: number, lng: number}
- `accuracy` (DECIMAL) - GPS accuracy in meters
- `heading` (DECIMAL) - Direction in degrees (0-360)
- `speed` (DECIMAL) - Speed in km/h
- `status` (VARCHAR) - 'idle', 'en_route', 'at_pickup', 'at_wash', 'at_dropoff'
- `timestamp` (TIMESTAMP) - When location was recorded

### Updated Tables

#### `users`
Added columns:
- `last_location_update` (TIMESTAMP) - Last time driver location was updated
- `current_booking_id` (UUID) - Active booking for driver

## Backend Implementation

### Services

#### `locationTrackingService.ts`
Core service for location operations:

**Key Methods:**
- `updateDriverLocation()` - Updates driver location with throttling (30s minimum interval)
- `getDriverLocation()` - Gets latest driver location
- `getActiveDriverLocations()` - Gets all active drivers (admin)
- `getBookingLocation()` - Gets booking location data with role-based access
- `calculateQueueMetrics()` - Calculates queue position and estimated wait time

**Features:**
- Location caching to prevent excessive writes
- Automatic cache cleanup
- Role-based access control
- Queue position calculation

### API Endpoints

#### `POST /api/location/update`
Update driver location
- **Auth**: Required
- **Body**: `{ coordinates, bookingId?, accuracy?, heading?, speed?, status? }`
- **Throttling**: 30 seconds minimum between updates

#### `GET /api/location/driver/:driverId`
Get driver location
- **Auth**: Required
- **Access**: Drivers (own location), Clients (assigned driver), Admins (all)

#### `GET /api/location/booking/:bookingId`
Get booking location data
- **Auth**: Required
- **Access**: Role-based (client sees own, driver sees assigned, admin sees all)
- **Returns**: Pickup coordinates, driver location, car wash location, queue position, ETA

#### `GET /api/location/drivers/active`
Get all active driver locations
- **Auth**: Required
- **Access**: Admin only
- **Returns**: Array of active drivers with locations

#### `GET /api/location/booking/:bookingId/history`
Get location history for booking
- **Auth**: Required
- **Access**: Role-based
- **Query**: `limit` (default: 50)

## Frontend Implementation

### Services

#### `locationTrackingService.ts`
Frontend service for location operations:

**Key Functions:**
- `updateDriverLocation()` - Update driver location on backend
- `getDriverLocation()` - Fetch driver location
- `getBookingLocation()` - Fetch booking location data
- `getActiveDriverLocations()` - Fetch all active drivers (admin)
- `startLocationTracking()` - Start real-time location tracking

**Features:**
- Automatic backend updates
- Throttled by backend (30s minimum)
- Handles geolocation API errors gracefully

### Component Updates

#### `MapView.tsx`
- Fetches real driver locations from backend
- Updates markers based on backend data
- Real-time refresh (10s intervals)

#### `LiveTracking.tsx`
- Uses `startLocationTracking()` for real-time updates
- Fetches booking location data from backend
- Displays queue position and ETA
- Shows route segments based on booking status

#### `AdminMapView.tsx`
- Fetches all active drivers
- Shows all bookings with locations
- Real-time monitoring dashboard

## Queue & ETA Logic

### Queue Position Calculation
1. Get all active bookings for car wash
2. Sort by `created_at` (FIFO)
3. Find booking position in queue
4. Calculate: `queuePosition = index + 1`

### Estimated Wait Time
- Formula: `estimatedWaitTime = queuePosition * averageServiceTime`
- Default: 30 minutes per car
- Updates automatically when queue changes

### ETA Display
- Shows: "X cars ahead"
- Shows: "Estimated start: HH:MM"
- Shows: "Estimated completion: HH:MM"
- Recalculates on status changes

## Real-Time Updates

### Update Intervals
- **Location Updates**: 30 seconds minimum (throttled)
- **Booking Status**: 5-10 seconds (polling)
- **Queue Metrics**: Recalculated on status change
- **Map Refresh**: 10 seconds

### Status-Based Tracking
- **'accepted'**: Track driver → pickup
- **'picked_up'**: Track driver → car wash
- **'at_wash'**: Track at car wash location
- **'delivered_to_wash'**: Track driver → dropoff

## Role-Based Access Control

### Client
- Can see: Own bookings, assigned driver location
- Cannot see: Other clients' bookings, other drivers

### Driver
- Can see: Assigned bookings, own location
- Cannot see: Other drivers' locations, unassigned bookings

### Car Wash
- Can see: Bookings for their location, assigned drivers
- Cannot see: Other car washes' bookings

### Admin
- Can see: All bookings, all drivers, all locations
- Full operational oversight

## Error Handling

### Backend
- Invalid coordinates validation
- Role-based access errors (403)
- Database errors (500)
- Throttling (silent, cached)

### Frontend
- Geolocation permission errors
- Network errors with retry
- Fallback to last known location
- Graceful degradation

## Performance Optimizations

1. **Location Caching**: Prevents excessive database writes
2. **Query Indexing**: Fast location-based queries
3. **Throttling**: 30s minimum between updates
4. **Batch Updates**: Group location updates when possible
5. **Selective Queries**: Only fetch needed data

## Testing Checklist

- [ ] Driver location updates work
- [ ] Throttling prevents excessive writes
- [ ] Role-based access control works
- [ ] Queue position calculates correctly
- [ ] ETA updates on status changes
- [ ] Real-time tracking works
- [ ] Admin can see all locations
- [ ] Error handling works
- [ ] Performance is acceptable

## Migration Steps

1. **Run SQL Migration**:
   ```sql
   -- Run backend/migrations/add-location-tracking.sql in Supabase
   ```

2. **Restart Backend**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Update Frontend**:
   - Components automatically use new services
   - No manual updates needed

4. **Test**:
   - Create a booking
   - Assign a driver
   - Verify location tracking works
   - Check queue position updates

## Next Steps

1. **WebSocket Integration** (Optional):
   - Replace polling with WebSockets
   - Real-time push updates
   - Lower latency

2. **Advanced Analytics**:
   - Driver performance metrics
   - Route optimization
   - Traffic-aware ETAs

3. **Offline Support**:
   - Cache locations locally
   - Sync when online
   - Queue updates

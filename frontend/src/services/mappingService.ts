/**
 * Mapping Service
 * 
 * Provides geospatial calculations and utilities for mapping features:
 * - Distance calculations (Haversine formula)
 * - Route optimization
 * - Proximity-based filtering
 * - Time and distance formatting
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface RouteSegment {
  from: Coordinates;
  to: Coordinates;
  distance: number; // in kilometers
  estimatedTime: number; // in minutes
}

export interface RoutePoint {
  id: string;
  name: string;
  coordinates: Coordinates;
  type: 'pickup' | 'wash' | 'dropoff';
  estimatedTime?: number;
}

export interface OptimizedRoute {
  points: RoutePoint[];
  segments: RouteSegment[];
  totalDistance: number;
  totalTime: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  from: Coordinates,
  to: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(to.lat - from.lat);
  const dLon = toRadians(to.lng - from.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.lat)) *
      Math.cos(toRadians(to.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate route segment with distance and estimated time
 */
export function calculateRouteSegment(
  from: Coordinates,
  to: Coordinates,
  averageSpeed: number = 50 // km/h
): RouteSegment {
  const distance = calculateDistance(from, to);
  const estimatedTime = (distance / averageSpeed) * 60; // Convert to minutes
  
  return {
    from,
    to,
    distance,
    estimatedTime: Math.round(estimatedTime),
  };
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}

/**
 * Format time for display
 */
export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Parse coordinates from various formats
 */
export function parseCoordinates(
  coords: string | Coordinates | null | undefined
): Coordinates | null {
  if (!coords) return null;
  
  if (typeof coords === 'object' && 'lat' in coords && 'lng' in coords) {
    return { lat: coords.lat, lng: coords.lng };
  }
  
  if (typeof coords === 'string') {
    try {
      // Try parsing as JSON
      const parsed = JSON.parse(coords);
      if (parsed.lat && parsed.lng) {
        return { lat: parsed.lat, lng: parsed.lng };
      }
    } catch {
      // Try parsing as "lat,lng" string
      const parts = coords.split(',');
      if (parts.length === 2) {
        const lat = parseFloat(parts[0].trim());
        const lng = parseFloat(parts[1].trim());
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    }
  }
  
  return null;
}

/**
 * Find nearby items within a radius
 */
export function findNearby<T extends { coordinates?: Coordinates | string | null }>(
  items: T[],
  center: Coordinates,
  radiusKm: number = 10
): T[] {
  return items
    .map((item) => {
      const coords = parseCoordinates(item.coordinates);
      if (!coords) return null;
      
      const distance = calculateDistance(center, coords);
      return { item, distance };
    })
    .filter((result): result is { item: T; distance: number } => 
      result !== null && result.distance <= radiusKm
    )
    .sort((a, b) => a.distance - b.distance)
    .map((result) => result.item);
}

/**
 * Optimize driver route using nearest-neighbor algorithm
 */
export function optimizeDriverRoute(
  startLocation: Coordinates,
  bookings: Array<{
    id: string;
    pickupCoordinates: Coordinates | string | null;
    carWashCoordinates?: Coordinates | string | null;
    dropoffCoordinates?: Coordinates | string | null;
    carWashName?: string;
    vehicleInfo?: string;
  }>
): OptimizedRoute | null {
  if (bookings.length === 0) return null;
  
  const points: RoutePoint[] = [];
  const segments: RouteSegment[] = [];
  
  // Parse all coordinates
  const parsedBookings = bookings
    .map((booking) => {
      const pickup = parseCoordinates(booking.pickupCoordinates);
      const wash = parseCoordinates(booking.carWashCoordinates);
      const dropoff = parseCoordinates(booking.dropoffCoordinates || booking.pickupCoordinates);
      
      return { ...booking, pickup, wash, dropoff };
    })
    .filter((b) => b.pickup !== null);
  
  if (parsedBookings.length === 0) return null;
  
  let currentLocation = startLocation;
  const visited = new Set<string>();
  
  // Nearest-neighbor algorithm
  while (visited.size < parsedBookings.length) {
    let nearest: typeof parsedBookings[0] | null = null;
    let nearestDistance = Infinity;
    let nearestType: 'pickup' | 'wash' | 'dropoff' = 'pickup';
    let nearestCoords: Coordinates | null = null;
    
    for (const booking of parsedBookings) {
      if (visited.has(booking.id)) continue;
      
      // Check pickup distance
      if (booking.pickup) {
        const dist = calculateDistance(currentLocation, booking.pickup);
        if (dist < nearestDistance) {
          nearest = booking;
          nearestDistance = dist;
          nearestType = 'pickup';
          nearestCoords = booking.pickup;
        }
      }
      
      // Check wash distance (if already picked up)
      if (booking.wash && visited.has(`${booking.id}-pickup`)) {
        const dist = calculateDistance(currentLocation, booking.wash);
        if (dist < nearestDistance) {
          nearest = booking;
          nearestDistance = dist;
          nearestType = 'wash';
          nearestCoords = booking.wash;
        }
      }
    }
    
    if (!nearest || !nearestCoords) break;
    
    // Add segment
    const segment = calculateRouteSegment(currentLocation, nearestCoords);
    segments.push(segment);
    
    // Add point
    const pointName = 
      nearestType === 'pickup' 
        ? `Pickup: ${nearest.vehicleInfo || 'Vehicle'}`
        : nearestType === 'wash'
        ? `Wash: ${nearest.carWashName || 'Car Wash'}`
        : `Dropoff: ${nearest.vehicleInfo || 'Vehicle'}`;
    
    points.push({
      id: `${nearest.id}-${nearestType}`,
      name: pointName,
      coordinates: nearestCoords,
      type: nearestType,
      estimatedTime: segment.estimatedTime,
    });
    
    visited.add(nearestType === 'pickup' ? `${nearest.id}-pickup` : nearest.id);
    currentLocation = nearestCoords;
  }
  
  const totalDistance = segments.reduce((sum, s) => sum + s.distance, 0);
  const totalTime = segments.reduce((sum, s) => sum + s.estimatedTime, 0);
  
  return {
    points,
    segments,
    totalDistance,
    totalTime,
  };
}

/**
 * Estimate queue wait time based on position and average service time
 */
export function estimateQueueWaitTime(
  position: number,
  averageServiceTimeMinutes: number = 30
): number {
  // Simple estimation: position * average service time
  // Could be enhanced with actual queue data
  return position * averageServiceTimeMinutes;
}

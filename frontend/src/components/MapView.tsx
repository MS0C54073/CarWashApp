/**
 * MapView Component
 * 
 * Core interactive map component using Mapbox GL JS
 * Supports:
 * - Multiple marker types (bookings, car washes, drivers)
 * - Route visualization
 * - Real-time location updates
 * - Role-based filtering
 */

import { useEffect, useRef, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getCurrentPosition, Coordinates } from '../services/locationService';
import { formatDistance } from '../services/mappingService';
import { getMapboxToken, DEFAULT_CENTER, DEFAULT_ZOOM } from '../config/mapbox';
import { parseCoordinates, calculateDistance } from '../services/mappingService';
import RouteVisualization from './mapping/RouteVisualization';
import api from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import './MapView.css';

const MAPBOX_TOKEN = getMapboxToken();

interface Booking {
  id: string;
  status: string;
  pickupLocation: string;
  pickupCoordinates?: Coordinates | string;
  carWashId?: {
    name?: string;
    carWashName?: string;
    location?: string;
    locationCoordinates?: Coordinates | string;
  };
  vehicleId?: {
    make?: string;
    model?: string;
    plateNo?: string;
  };
  clientId?: {
    name?: string;
  };
  driverId?: {
    name?: string;
  };
}

interface CarWash {
  id: string;
  name?: string;
  carWashName?: string;
  location?: string;
  locationCoordinates?: Coordinates | string;
}

interface Driver {
  id: string;
  name: string;
  locationCoordinates?: Coordinates | string;
}

interface RouteSegment {
  from: Coordinates;
  to: Coordinates;
  distance: number;
  estimatedTime: number;
}

interface MapViewProps {
  bookings?: Booking[];
  activeBookingId?: string;
  onBookingClick?: (booking: Booking) => void;
  showNearbyServices?: boolean;
  showCarWashes?: boolean;
  showDrivers?: boolean;
  showRoute?: boolean;
  routeSegments?: RouteSegment[];
  center?: Coordinates;
  zoom?: number;
  height?: string;
}

const MapView = ({
  bookings = [],
  activeBookingId,
  onBookingClick,
  showNearbyServices = false,
  showCarWashes = false,
  showDrivers = false,
  showRoute = false,
  routeSegments = [],
  center,
  zoom = DEFAULT_ZOOM,
  height = '100%',
}: MapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch car washes if needed
  const { data: carWashes } = useQuery<CarWash[]>({
    queryKey: ['carwashes-map'],
    queryFn: async () => {
      try {
        const response = await api.get('/carwash/list');
        return response.data.data || [];
      } catch (error) {
        console.error('Error fetching car washes:', error);
        return [];
      }
    },
    enabled: showNearbyServices || showCarWashes,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Fetch drivers if needed
  const { data: drivers } = useQuery<Driver[]>({
    queryKey: ['drivers-map'],
    queryFn: async () => {
      try {
        const response = await api.get('/drivers/available');
        return response.data.data || [];
      } catch (error) {
        console.error('Error fetching drivers:', error);
        return [];
      }
    },
    enabled: showNearbyServices || showDrivers,
    staleTime: 10000, // Cache for 10 seconds (more dynamic)
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Validate token
    if (!MAPBOX_TOKEN || !MAPBOX_TOKEN.startsWith('pk.')) {
      setMapError('Invalid Mapbox token. Please configure VITE_MAPBOX_TOKEN in environment variables.');
      setMapLoaded(true);
      return;
    }

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      const initialCenter: [number, number] = center
        ? [center.lng, center.lat]
        : DEFAULT_CENTER;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: initialCenter,
        zoom: zoom,
        attributionControl: false,
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      // Handle map load
      map.current.on('load', () => {
        setMapLoaded(true);
        setMapError(null);
      });

      // Handle map errors
      map.current.on('error', (e: any) => {
        console.error('Mapbox error:', e);
        setMapError(e.error?.message || 'Failed to load map');
        setMapLoaded(true); // Show container even on error
      });

      // Timeout fallback
      const loadTimeout = setTimeout(() => {
        if (!mapLoaded) {
          console.warn('Map load timeout - showing map anyway');
          setMapLoaded(true);
        }
      }, 10000);

      return () => {
        clearTimeout(loadTimeout);
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (error: any) {
      console.error('Error initializing map:', error);
      setMapError(error.message || 'Failed to initialize map');
      setMapLoaded(true);
    }
  }, []); // Only run once on mount

  // Get user location
  useEffect(() => {
    if (!showNearbyServices) return;

    getCurrentPosition()
      .then((position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError(null);
      })
      .catch((error) => {
        console.warn('Location error:', error);
        setLocationError('Could not get your location. Please enable location services.');
      });
  }, [showNearbyServices]);

  // Update map center when center prop changes
  useEffect(() => {
    if (!map.current || !center) return;
    map.current.flyTo({
      center: [center.lng, center.lat],
      zoom: zoom,
      duration: 1000,
    });
  }, [center, zoom]);

  // Auto-fit map to route when route segments are provided
  useEffect(() => {
    if (!map.current || !mapLoaded || !showRoute || !routeSegments || routeSegments.length === 0) return;

    try {
      // Collect all coordinates from route segments
      const coordinates: [number, number][] = [];
      
      routeSegments.forEach((segment) => {
        coordinates.push([segment.from.lng, segment.from.lat]);
        coordinates.push([segment.to.lng, segment.to.lat]);
      });

      if (coordinates.length === 0) return;

      // Calculate bounds
      const lngs = coordinates.map(c => c[0]);
      const lats = coordinates.map(c => c[1]);
      
      const bounds = new mapboxgl.LngLatBounds(
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)]
      );

      // Add padding
      const padding = { top: 50, bottom: 50, left: 50, right: 50 };
      
      // Fit map to bounds
      map.current.fitBounds(bounds, {
        padding,
        duration: 1000,
        maxZoom: 15,
      });
    } catch (error) {
      console.error('Error fitting map to route:', error);
    }
  }, [mapLoaded, showRoute, routeSegments]);

  // Update markers when data changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Add booking markers
    bookings.forEach((booking) => {
      const coords = parseCoordinates(booking.pickupCoordinates);
      if (!coords) return;

      const isActive = booking.id === activeBookingId;
      const el = createMarkerElement('booking', booking.status, isActive);
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat([coords.lng, coords.lat])
        .addTo(map.current!);

      if (onBookingClick) {
        el.addEventListener('click', () => onBookingClick(booking));
        el.style.cursor = 'pointer';
      }

      markersRef.current.set(`booking-${booking.id}`, marker);
    });

    // Add car wash markers
    if (carWashes) {
      carWashes.forEach((carWash) => {
        const coords = parseCoordinates(carWash.locationCoordinates);
        if (!coords) return;

        const el = createMarkerElement('carwash');
        const marker = new mapboxgl.Marker(el)
          .setLngLat([coords.lng, coords.lat])
          .addTo(map.current!);

        markersRef.current.set(`carwash-${carWash.id}`, marker);
      });
    }

    // Add driver markers
    if (drivers) {
      drivers.forEach((driver) => {
        const coords = parseCoordinates(driver.locationCoordinates);
        if (!coords) return;

        const el = createMarkerElement('driver');
        const marker = new mapboxgl.Marker(el)
          .setLngLat([coords.lng, coords.lat])
          .addTo(map.current!);

        markersRef.current.set(`driver-${driver.id}`, marker);
      });
    }

    // Add user location marker
    if (userLocation) {
      const el = createMarkerElement('user');
      const marker = new mapboxgl.Marker(el)
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current!);

      markersRef.current.set('user-location', marker);
    }

    // Add route markers (pickup and destination) when route is shown
    if (showRoute && routeSegments && routeSegments.length > 0) {
      // Remove existing route markers first
      const existingPickup = markersRef.current.get('route-pickup');
      const existingDest = markersRef.current.get('route-destination');
      if (existingPickup) {
        existingPickup.remove();
        markersRef.current.delete('route-pickup');
      }
      if (existingDest) {
        existingDest.remove();
        markersRef.current.delete('route-destination');
      }

      routeSegments.forEach((segment, index) => {
        // Pickup point marker (only for first segment)
        if (index === 0) {
          const pickupEl = createMarkerElement('pickup');
          const pickupMarker = new mapboxgl.Marker(pickupEl)
            .setLngLat([segment.from.lng, segment.from.lat])
            .addTo(map.current!);
          markersRef.current.set('route-pickup', pickupMarker);
        }

        // Destination point marker (for last segment)
        if (index === routeSegments.length - 1) {
          const destEl = createMarkerElement('destination');
          const destMarker = new mapboxgl.Marker(destEl)
            .setLngLat([segment.to.lng, segment.to.lat])
            .addTo(map.current!);
          markersRef.current.set('route-destination', destMarker);
        }
      });
    } else {
      // Remove route markers when route is not shown
      const existingPickup = markersRef.current.get('route-pickup');
      const existingDest = markersRef.current.get('route-destination');
      if (existingPickup) {
        existingPickup.remove();
        markersRef.current.delete('route-pickup');
      }
      if (existingDest) {
        existingDest.remove();
        markersRef.current.delete('route-destination');
      }
    }

    // Fit bounds to show all markers (including route markers)
    if (markersRef.current.size > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      markersRef.current.forEach((marker) => {
        const lngLat = marker.getLngLat();
        bounds.extend([lngLat.lng, lngLat.lat]);
      });
      
      if (map.current) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15,
        });
      }
    }
  }, [bookings, carWashes, drivers, userLocation, activeBookingId, mapLoaded, onBookingClick, showRoute, routeSegments]);

  // Helper to create marker elements
  const createMarkerElement = (
    type: 'booking' | 'carwash' | 'driver' | 'user' | 'pickup' | 'destination',
    status?: string,
    isActive?: boolean
  ): HTMLElement => {
    const el = document.createElement('div');
    el.className = `map-marker map-marker-${type} ${isActive ? 'active' : ''}`;
    
    const icons: Record<string, string> = {
      booking: '📋',
      carwash: '🧼',
      driver: '🚗',
      user: '📍',
      pickup: '📍',
      destination: '🏁',
    };
    
    el.innerHTML = `<div class="marker-icon">${icons[type] || '📍'}</div>`;
    return el;
  };

  return (
    <div className="map-container" style={{ height }}>
      {!mapLoaded && !mapError ? (
        <div className="map-loading-overlay">
          <LoadingSpinner size="lg" />
          <p>Loading map...</p>
        </div>
      ) : null}
      <div
        ref={mapContainer}
        className="map-view"
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px',
          display: 'block',
        }}
      />
      {mapLoaded && showRoute && routeSegments.length > 0 && map.current && (
        <RouteVisualization
          map={map.current}
          route={routeSegments}
          color="#3b82f6"
        />
      )}
      {mapError && (
        <div className="map-error-overlay">
          <div className="map-error-message">
            <span>⚠️ {mapError}</span>
          </div>
        </div>
      )}
      {locationError && (
        <div className="map-error-overlay">
          <div className="map-error-message">
            <span>⚠️ {locationError}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;

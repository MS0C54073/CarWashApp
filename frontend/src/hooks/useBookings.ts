/**
 * useBookings Hook
 * Single source of truth for booking data across the application
 * Ensures consistent state and real-time updates
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Booking {
  id: string;
  status: string;
  pickupLocation: string;
  pickupCoordinates?: {
    lat: number;
    lng: number;
  };
  carWashId?: any;
  vehicleId?: any;
  driverId?: any;
  clientId?: any;
  createdAt: string;
  updatedAt: string;
}

interface UseBookingsOptions {
  filters?: {
    status?: string;
    role?: 'client' | 'driver' | 'carwash' | 'admin';
  };
  refetchInterval?: number | false;
  enabled?: boolean;
}

/**
 * Centralized hook for fetching bookings
 * Automatically filters based on user role
 */
export const useBookings = (options: UseBookingsOptions = {}) => {
  const { user } = useAuth();
  const { filters = {}, refetchInterval = false, enabled = true } = options;

  return useQuery({
    queryKey: ['bookings', user?.id, user?.role, filters],
    queryFn: async () => {
      try {
        if (!user || !user.id) {
          console.warn('useBookings: No user found, skipping fetch');
          return [];
        }

        let endpoint = '/bookings';
        
        // Role-specific endpoints
        if (user.role === 'driver') {
          endpoint = '/drivers/bookings';
        } else if (user.role === 'carwash') {
          endpoint = '/carwash/bookings';
        }

        console.log(`📡 Fetching bookings from ${endpoint} for user ${user.id} (${user.role})`);
        const response = await api.get(endpoint);
        
        // Validate response structure
        if (!response || !response.data) {
          throw new Error('Invalid response from server');
        }

        // Handle different response formats
        let bookings: Booking[] = [];
        if (response.data.success === false) {
          throw new Error(response.data.message || 'Failed to fetch bookings');
        }

        if (Array.isArray(response.data)) {
          bookings = response.data;
        } else if (response.data.data) {
          bookings = Array.isArray(response.data.data) ? response.data.data : [];
        } else if (response.data.bookings) {
          bookings = Array.isArray(response.data.bookings) ? response.data.bookings : [];
        }

        // Validate bookings array
        if (!Array.isArray(bookings)) {
          console.warn('⚠️ Bookings data is not an array:', bookings);
          bookings = [];
        }

        console.log(`✅ Received ${bookings.length} bookings`);
        
        // Apply client-side filters if needed
        if (filters.status) {
          bookings = bookings.filter((b) => b && b.status === filters.status);
        }

        return bookings;
      } catch (error: any) {
        // Log error but let React Query handle it
        console.error('❌ Error in useBookings queryFn:', error);
        // Re-throw so React Query can handle it properly
        throw error;
      }
    },
    enabled: enabled && !!user && !!user.id,
    refetchInterval: refetchInterval,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: (failureCount, error: any) => {
      // Don't retry on 401/403 (auth errors)
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      // Retry once for other errors
      return failureCount < 1;
    },
    retryDelay: 1000,
    // Ensure errors are properly propagated
    throwOnError: false, // Let React Query handle error state
  });
};

/**
 * Hook for fetching a single booking
 */
export const useBooking = (bookingId: string | null, options: { refetchInterval?: number } = {}) => {
  const { refetchInterval = 5000 } = options;

  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      if (!bookingId) return null;
      
      const response = await api.get(`/bookings/${bookingId}`);
      
      // Validate response
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to fetch booking');
      }

      return response.data.data || null;
    },
    enabled: !!bookingId,
    refetchInterval: refetchInterval,
    staleTime: 3000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403 || error?.response?.status === 404) {
        return false;
      }
      return failureCount < 1;
    },
  });
};

/**
 * Hook for invalidating and refetching bookings
 */
export const useRefreshBookings = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return () => {
    queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] });
  };
};


/**
 * Get active bookings (those that should show live tracking)
 */
export const getActiveBookings = (bookings: Booking[]): Booking[] => {
  if (!bookings) return [];

  const activeStatuses = ['accepted', 'picked_up', 'at_wash', 'waiting_bay', 'washing_bay', 'drying_bay'];
  return bookings.filter((booking) => activeStatuses.includes(booking.status));
};

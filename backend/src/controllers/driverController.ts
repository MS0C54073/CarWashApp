import { Response } from 'express';
import { DBService } from '../services/db-service';
import { AuthRequest } from '../middleware/auth';
import { NotificationService } from '../services/notificationService';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  InternalServerError
} from '../shared/errors/AppError';
import { asyncHandler } from '../shared/errors/errorHandler';
import { ApiSuccessResponse } from '../shared/types/api.types';

// Helper to convert snake_case to camelCase
const toCamelCase = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(toCamelCase);
  }
  if (obj !== null && typeof obj === 'object') {
    const camelObj: any = {};
    for (const key in obj) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      camelObj[camelKey] = toCamelCase(obj[key]);
    }
    return camelObj;
  }
  return obj;
};

// @desc    Get available drivers
// @route   GET /api/drivers/available
// @access  Private
export const getAvailableDrivers = asyncHandler(async (_req: AuthRequest, res: Response): Promise<void> => {
  const drivers = await DBService.getAvailableDrivers();

  if (!Array.isArray(drivers)) {
    throw new InternalServerError('Invalid data format received from database');
  }

  const response: ApiSuccessResponse = {
    success: true,
    count: drivers.length,
    data: drivers.map((d: any) => {
      const { password, ...driverWithoutPassword } = d;
      return driverWithoutPassword;
    }),
  };

  res.json(response);
});

// @desc    Get driver bookings
// @route   GET /api/drivers/bookings
// @access  Private (Driver)
export const getDriverBookings = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user || !req.user.id) {
    throw new ForbiddenError('User not authenticated');
  }

  // Get bookings assigned to this driver OR pending pickup_delivery bookings (for driver to accept)
  const { supabase } = await import('../config/supabase');

  // First get assigned bookings
  let assignedQuery = supabase
    .from('bookings')
    .select(`
      *,
      client:users!bookings_client_id_fkey(*),
      driver:users!bookings_driver_id_fkey(*),
      car_wash:users!bookings_car_wash_id_fkey(*),
      vehicle:vehicles(*),
      service:services(*)
    `)
    .eq('driver_id', req.user.id)
    .order('created_at', { ascending: false });

  if (req.query.status) {
    assignedQuery = assignedQuery.eq('status', req.query.status as string);
  }

  const { data: assignedBookings, error: assignedError } = await assignedQuery;

  if (assignedError) {
    throw new InternalServerError(`Failed to fetch assigned bookings: ${assignedError.message}`);
  }

  // Then get pending pickup_delivery bookings (available for acceptance)
  let pendingQuery = supabase
    .from('bookings')
    .select(`
      *,
      client:users!bookings_client_id_fkey(*),
      driver:users!bookings_driver_id_fkey(*),
      car_wash:users!bookings_car_wash_id_fkey(*),
      vehicle:vehicles(*),
      service:services(*)
    `)
    .eq('status', 'pending')
    .eq('booking_type', 'pickup_delivery')
    .is('driver_id', null)
    .order('created_at', { ascending: false });

  const { data: pendingBookings, error: pendingError } = await pendingQuery;

  if (pendingError) {
    throw new InternalServerError(`Failed to fetch pending bookings: ${pendingError.message}`);
  }

  // Combine and deduplicate
  const allBookings = [...(assignedBookings || []), ...(pendingBookings || [])];
  const uniqueBookings = Array.from(
    new Map(allBookings.map((b: any) => [b.id, b])).values()
  );

  // Convert to camelCase and map relations
  const bookings = uniqueBookings.map((b: any) => {
    const camel = toCamelCase(b);
    if (camel.client) camel.clientId = camel.client;
    if (camel.driver) camel.driverId = camel.driver;
    if (camel.carWash) camel.carWashId = camel.carWash;
    if (camel.vehicle) camel.vehicleId = camel.vehicle;
    if (camel.service) camel.serviceId = camel.service;
    return camel;
  });

  // Validate bookings array
  if (!Array.isArray(bookings)) {
    throw new InternalServerError('Invalid data format received from database');
  }

  const response: ApiSuccessResponse = {
    success: true,
    count: bookings.length,
    data: bookings,
  };

  res.json(response);
});

// @desc    Accept booking
// @route   PUT /api/drivers/bookings/:id/accept
// @access  Private (Driver)
export const acceptBooking = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user || !req.user.id) {
    throw new ForbiddenError('User not authenticated');
  }

  if (!req.params.id) {
    throw new BadRequestError('Booking ID is required');
  }

  const booking = await DBService.getBookingById(req.params.id);

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  if (booking.status !== 'pending') {
    throw new BadRequestError('Booking is not available for acceptance. Status must be pending.');
  }

  if (booking.bookingType !== 'pickup_delivery') {
    throw new BadRequestError('Only pickup & delivery bookings can be accepted by drivers');
  }

  const updatedBooking = await DBService.updateBooking(req.params.id, {
    driverId: req.user.id,
    status: 'accepted',
  });

  if (!updatedBooking) {
    throw new InternalServerError('Failed to accept booking');
  }

  // Notify client
  await NotificationService.createNotification({
    userId: updatedBooking.clientId,
    type: 'booking_update',
    title: 'Booking Accepted',
    message: `A driver has accepted your booking and will pickup your vehicle soon.`,
    data: { bookingId: updatedBooking.id },
    priority: 'high',
  });

  // Notify car wash
  await NotificationService.createNotification({
    userId: updatedBooking.carWashId,
    type: 'booking_update',
    title: 'Driver Assigned',
    message: `A driver has been assigned to a booking for your car wash.`,
    data: { bookingId: updatedBooking.id },
  });

  const response: ApiSuccessResponse = {
    success: true,
    data: updatedBooking,
    message: 'Booking accepted successfully',
  };

  res.json(response);
});

// @desc    Decline booking
// @route   PUT /api/drivers/bookings/:id/decline
// @access  Private (Driver)
export const declineBooking = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user || !req.user.id) {
    throw new ForbiddenError('User not authenticated');
  }

  if (!req.params.id) {
    throw new BadRequestError('Booking ID is required');
  }

  const booking = await DBService.getBookingById(req.params.id);

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  const bookingDriverId = typeof booking.driverId === 'object' ? booking.driverId?.id : booking.driverId;
  if (bookingDriverId !== req.user.id) {
    throw new ForbiddenError('You are not assigned to this booking');
  }

  const updatedBooking = await DBService.updateBooking(req.params.id, {
    driverId: null,
    status: 'pending',
  });

  if (!updatedBooking) {
    throw new InternalServerError('Failed to decline booking');
  }

  // Notify client that driver changed (optional but good)
  await NotificationService.createNotification({
    userId: updatedBooking.clientId,
    type: 'booking_update',
    title: 'Driver Update',
    message: `Your assigned driver had to decline. We are finding another driver for you.`,
    data: { bookingId: updatedBooking.id },
  });

  const response: ApiSuccessResponse = {
    success: true,
    data: { id: req.params.id },
    message: 'Booking declined successfully',
  };

  res.json(response);
});

// @desc    Update driver availability
// @route   PUT /api/drivers/availability
// @access  Private (Driver)
export const updateAvailability = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user || !req.user.id) {
    throw new ForbiddenError('User not authenticated');
  }

  const { availability } = req.body;

  if (typeof availability !== 'boolean') {
    throw new BadRequestError('Availability must be a boolean value');
  }

  const driver = await DBService.updateUser(req.user.id, { availability });

  if (!driver) {
    throw new InternalServerError('Failed to update availability');
  }

  const { password, ...driverWithoutPassword } = driver;

  const response: ApiSuccessResponse = {
    success: true,
    data: driverWithoutPassword,
  };

  res.json(response);
});

// @desc    Get driver earnings
// @route   GET /api/drivers/earnings
// @access  Private (Driver)
export const getDriverEarnings = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user || !req.user.id) {
    throw new ForbiddenError('User not authenticated');
  }

  const driverId = req.user.id;

  // Get all completed bookings for this driver
  const bookings = await DBService.getBookings({
    driverId,
    status: 'completed',
    paymentStatus: 'paid',
  });

  if (!Array.isArray(bookings)) {
    throw new InternalServerError('Invalid data format received from database');
  }

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  let totalEarnings = 0;
  let completedJobs = bookings.length;
  let pendingEarnings = 0;
  let thisMonth = 0;
  let lastMonth = 0;

  // Calculate earnings (assuming 20% commission for driver)
  const driverCommissionRate = 0.2;

  bookings.forEach((booking: any) => {
    const earnings = parseFloat(booking.totalAmount || 0) * driverCommissionRate;
    totalEarnings += earnings;

    const bookingDate = new Date(booking.updatedAt || booking.createdAt);
    if (bookingDate >= thisMonthStart) {
      thisMonth += earnings;
    } else if (bookingDate >= lastMonthStart && bookingDate <= lastMonthEnd) {
      lastMonth += earnings;
    }
  });

  // Get pending bookings
  const pendingBookings = await DBService.getBookings({
    driverId,
    paymentStatus: 'pending',
  });

  if (Array.isArray(pendingBookings)) {
    pendingBookings.forEach((booking: any) => {
      pendingEarnings += parseFloat(booking.totalAmount || 0) * driverCommissionRate;
    });
  }

  const response: ApiSuccessResponse = {
    success: true,
    data: {
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      completedJobs,
      pendingEarnings: Math.round(pendingEarnings * 100) / 100,
      thisMonth: Math.round(thisMonth * 100) / 100,
      lastMonth: Math.round(lastMonth * 100) / 100,
    },
  };

  res.json(response);
});

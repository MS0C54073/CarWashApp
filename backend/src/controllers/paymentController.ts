import { Response } from 'express';
import { validationResult } from 'express-validator';
import { DBService } from '../services/db-service';
import { AuthRequest } from '../middleware/auth';

// @desc    Initiate payment
// @route   POST /api/payments/initiate
// @access  Private
export const initiatePayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { bookingId, method, transactionId } = req.body;

    const booking = await DBService.getBookingById(bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Verify authorization
    if (req.user!.role !== 'admin' && booking.clientId !== req.user!.id) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    // Check if booking is ready for payment
    if (booking.status !== 'delivered_to_client' && booking.status !== 'wash_completed') {
      res.status(400).json({
        success: false,
        message: 'Booking is not ready for payment',
      });
      return;
    }

    let payment = await DBService.getPaymentByBookingId(bookingId);

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment record not found' });
      return;
    }

    payment = await DBService.updatePayment(payment.id, {
      method,
      transactionId,
      status: 'completed',
      paymentDate: new Date().toISOString(),
    });

    // Update booking
    await DBService.updateBooking(bookingId, {
      paymentStatus: 'paid',
      status: booking.status === 'delivered_to_client' ? 'completed' : booking.status,
    });

    res.json({
      success: true,
      data: payment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Get payment by booking ID
// @route   GET /api/payments/booking/:bookingId
// @access  Private
export const getPaymentByBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const payment = await DBService.getPaymentByBookingId(req.params.bookingId);

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment not found' });
      return;
    }

    const booking = await DBService.getBookingById(req.params.bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Verify authorization
    if (
      req.user!.role !== 'admin' &&
      booking.clientId !== req.user!.id &&
      (booking.driverId && booking.driverId !== req.user!.id) &&
      booking.carWashId !== req.user!.id
    ) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private (Admin)
export const verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { paymentId, status } = req.body;

    const payment = await DBService.getPaymentByBookingId(paymentId);
    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment not found' });
      return;
    }

    const updatedPayment = await DBService.updatePayment(payment.id, { status });

    if (status === 'completed') {
      const booking = await DBService.getBookingById(payment.bookingId);
      if (booking) {
        await DBService.updateBooking(booking.id, {
          paymentStatus: 'paid',
          status: booking.status === 'delivered_to_client' ? 'completed' : booking.status,
        });
      }
    }

    res.json({
      success: true,
      data: updatedPayment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

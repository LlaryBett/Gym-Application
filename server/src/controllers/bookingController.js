import Booking from '../models/Booking.js';
import { bookingSchemas } from '../utils/validation.js';

// ==================== CREATE BOOKING ====================
export const createBooking = async (req, res) => {
    try {
        const { error, value } = bookingSchemas.create.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map(detail => detail.message)
            });
        }

        const booking = await Booking.create(value);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking
        });

    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create booking',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ==================== GET BOOKINGS ====================

export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            data: booking
        });

    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking'
        });
    }
};

export const getUserBookings = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, status, upcoming, past } = req.query;

        const filters = { status };
        if (upcoming) filters.upcoming = upcoming;
        if (past) filters.past = past;

        const result = await Booking.findByMemberId(userId, page, limit, filters);

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Get user bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user bookings'
        });
    }
};

export const getTrainerBookings = async (req, res) => {
    try {
        const { trainerId } = req.params;
        const { page = 1, limit = 10, status, date } = req.query;

        const filters = { status, date };
        const result = await Booking.findByTrainerId(trainerId, page, limit, filters);

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Get trainer bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch trainer bookings'
        });
    }
};

export const getAllBookings = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, member_id, trainer_id, from_date, to_date } = req.query;

        const filters = { status, member_id, trainer_id, from_date, to_date };
        const result = await Booking.findAll(page, limit, filters);

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings'
        });
    }
};

// ==================== UPDATE BOOKING ====================

export const updateBookingStatus = async (req, res) => {
    try {
        const { error, value } = bookingSchemas.updateStatus.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map(detail => detail.message)
            });
        }

        const { status, reason } = value;
        const booking = await Booking.updateStatus(req.params.id, status, req.session.user.id, reason);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            message: `Booking ${status} successfully`,
            data: booking
        });

    } catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update booking status'
        });
    }
};

export const rescheduleBooking = async (req, res) => {
    try {
        const { error, value } = bookingSchemas.reschedule.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map(detail => detail.message)
            });
        }

        const { new_date, new_time } = value;
        const booking = await Booking.reschedule(req.params.id, new_date, new_time, req.session.user.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            message: 'Booking rescheduled successfully',
            data: booking
        });

    } catch (error) {
        console.error('Reschedule booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reschedule booking'
        });
    }
};

// ==================== DELETE BOOKING ====================

export const deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.delete(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            message: 'Booking deleted successfully',
            data: {
                id: booking.id,
                booking_number: booking.booking_number
            }
        });

    } catch (error) {
        console.error('Delete booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete booking'
        });
    }
};

// ==================== AVAILABILITY ====================

export const checkAvailability = async (req, res) => {
    try {
        const { trainerId, date } = req.query;

        if (!trainerId || !date) {
            return res.status(400).json({
                success: false,
                message: 'Trainer ID and date are required'
            });
        }

        const slots = await Booking.checkAvailability(trainerId, date);
        
        const bookedSlots = slots
            .filter(slot => slot.is_booked)
            .map(slot => slot.available_time);

        res.json({
            success: true,
            data: {
                date,
                trainerId,
                slots,
                bookedSlots
            }
        });

    } catch (error) {
        console.error('Check availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check availability'
        });
    }
};

export const createAvailabilitySlots = async (req, res) => {
    try {
        const { error, value } = bookingSchemas.availability.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map(detail => detail.message)
            });
        }

        const { trainer_id, date, times } = value;
        const slots = await Booking.createAvailabilitySlots(trainer_id, date, times);

        res.status(201).json({
            success: true,
            message: 'Availability slots created successfully',
            data: slots
        });

    } catch (error) {
        console.error('Create availability slots error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create availability slots'
        });
    }
};

// ==================== STATISTICS ====================

export const getBookingStats = async (req, res) => {
    try {
        const stats = await Booking.getStats();

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Get booking stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking statistics'
        });
    }
};

// ==================== HISTORY ====================

export const getBookingHistory = async (req, res) => {
    try {
        const history = await Booking.getHistory(req.params.id);

        res.json({
            success: true,
            data: history
        });

    } catch (error) {
        console.error('Get booking history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking history'
        });
    }
};
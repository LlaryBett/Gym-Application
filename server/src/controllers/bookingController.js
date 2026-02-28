import Booking from '../models/Booking.js';
import { bookingSchemas } from '../utils/validation.js';

// ==================== CREATE BOOKING ====================
export const createBooking = async (req, res) => {
    try {
        // Add member_id from authenticated user
        const bookingData = {
            ...req.body,
            member_id: req.user.id,
            member_name: req.user.name,
            member_email: req.user.email
        };

        const { error, value } = bookingSchemas.create.validate(bookingData, {
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

        // Check authorization based on role
        if (req.user.role === 'member' && booking.member_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only view your own bookings.'
            });
        }

        if (req.user.role === 'trainer' && booking.trainer_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only view your own trainer bookings.'
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
        
        // Check if user is accessing their own bookings or is admin/trainer
        if (req.user.role === 'member' && parseInt(userId) !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only view your own bookings.'
            });
        }

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
        
        // Check if trainer is accessing their own bookings or is admin
        if (req.user.role === 'trainer' && parseInt(trainerId) !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only view your own trainer bookings.'
            });
        }

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
        console.log('========== GET ALL BOOKINGS ==========');
        console.log('User role:', req.user.role);
        console.log('Query params:', req.query);
        
        // Only admins can access this endpoint
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const { 
            page = 1, 
            limit = 10, 
            search,
            status, 
            member_id, 
            trainer_id, 
            dateFrom, 
            dateTo 
        } = req.query;

        const filters = { 
            status, 
            member_id, 
            trainer_id, 
            from_date: dateFrom, 
            to_date: dateTo,
            search 
        };
        
        console.log('Filters:', filters);
        
        const result = await Booking.findAll(page, limit, filters);
        
        console.log(`Found ${result.bookings?.length || 0} bookings`);
        console.log('=======================================');

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('❌ Get all bookings error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ==================== UPDATE BOOKING ====================

export const updateBookingStatus = async (req, res) => {
    try {
        console.log('========== UPDATE BOOKING STATUS ==========');
        console.log('Request params:', req.params);
        console.log('Request body:', req.body);
        console.log('User:', req.user);
        
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check authorization based on role
        if (req.user.role === 'member') {
            // Members can only cancel their own pending bookings
            if (booking.member_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only modify your own bookings.'
                });
            }
            if (booking.status !== 'pending') {
                return res.status(403).json({
                    success: false,
                    message: 'You can only cancel pending bookings.'
                });
            }
            if (req.body.status !== 'cancelled') {
                return res.status(403).json({
                    success: false,
                    message: 'Members can only cancel bookings.'
                });
            }
        }

        if (req.user.role === 'trainer') {
            // Trainers can only modify their own bookings
            if (booking.trainer_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only modify your own trainer bookings.'
                });
            }
        }

        const { error, value } = bookingSchemas.updateStatus.validate(req.body);
        if (error) {
            console.log('Validation error:', error.details);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map(detail => detail.message)
            });
        }

        console.log('Validated data:', value);
        
        const { status, reason } = value;
        const bookingId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;
        
        console.log(`Updating booking ${bookingId} to status: ${status} by user: ${userId} (${userRole})`);

        const updatedBooking = await Booking.updateStatus(bookingId, status, userId, userRole, reason);

        if (!updatedBooking) {
            console.log('Booking not found or update failed');
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        console.log('Booking updated successfully:', updatedBooking);
        console.log('==========================================');

        res.json({
            success: true,
            message: `Booking ${status} successfully`,
            data: updatedBooking
        });

    } catch (error) {
        console.error('❌ Update booking status error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to update booking status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const rescheduleBooking = async (req, res) => {
    try {
        console.log('========== RESCHEDULE BOOKING ==========');
        console.log('Request params:', req.params);
        console.log('Request body:', req.body);
        console.log('User:', req.user);
        
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check authorization based on role
        if (req.user.role === 'member') {
            // Members can only reschedule their own confirmed bookings
            if (booking.member_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only reschedule your own bookings.'
                });
            }
            if (booking.status !== 'confirmed') {
                return res.status(403).json({
                    success: false,
                    message: 'You can only reschedule confirmed bookings.'
                });
            }
        }

        if (req.user.role === 'trainer') {
            // Trainers can only reschedule their own bookings
            if (booking.trainer_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only reschedule your own trainer bookings.'
                });
            }
        }

        const { error, value } = bookingSchemas.reschedule.validate(req.body);
        if (error) {
            console.log('Validation error:', error.details);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map(detail => detail.message)
            });
        }

        const { new_date, new_time } = value;
        const userId = req.user.id;
        const userRole = req.user.role;
        
        const updatedBooking = await Booking.reschedule(req.params.id, new_date, new_time, userId, userRole);

        if (!updatedBooking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        console.log('Booking rescheduled successfully');
        console.log('=======================================');

        res.json({
            success: true,
            message: 'Booking rescheduled successfully',
            data: updatedBooking
        });

    } catch (error) {
        console.error('❌ Reschedule booking error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to reschedule booking',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ==================== DELETE BOOKING ====================

export const deleteBooking = async (req, res) => {
    try {
        console.log('========== DELETE BOOKING ==========');
        console.log('Request params:', req.params);
        console.log('User:', req.user);
        
        // Only admins can delete bookings
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        const booking = await Booking.delete(req.params.id, req.user.id, req.user.role);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        console.log('Booking deleted successfully');
        console.log('===================================');

        res.json({
            success: true,
            message: 'Booking deleted successfully',
            data: {
                id: booking.id,
                booking_number: booking.booking_number
            }
        });

    } catch (error) {
        console.error('❌ Delete booking error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Failed to delete booking',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
        // Only trainers and admins can create availability slots
        if (!['admin', 'trainer'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Trainers or admins only.'
            });
        }

        const { error, value } = bookingSchemas.availability.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map(detail => detail.message)
            });
        }

        const { trainer_id, date, times } = value;
        
        // If trainer is creating slots, ensure they're creating for themselves
        if (req.user.role === 'trainer' && parseInt(trainer_id) !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Trainers can only create availability slots for themselves.'
            });
        }

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
        // Only admins can view statistics
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

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
        // Only admins can view booking history
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

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
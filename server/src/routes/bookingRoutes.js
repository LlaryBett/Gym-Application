import express from 'express';
import {
    createBooking,
    getBookingById,
    getUserBookings,
    getTrainerBookings,
    getAllBookings,
    updateBookingStatus,
    rescheduleBooking,
    deleteBooking,
    checkAvailability,
    createAvailabilitySlots,
    getBookingStats,
    getBookingHistory
} from '../controllers/bookingController.js';
import { authMiddleware, adminMiddleware, trainerMiddleware } from '../middleware/auth.js';

const router = express.Router();

// ==================== PUBLIC ROUTES (require auth) ====================
router.use(authMiddleware); // All booking routes require authentication

// Bookings
router.post('/', createBooking);
router.get('/user/:userId', getUserBookings);
router.get('/availability', checkAvailability);
router.get('/stats', getBookingStats);
router.get('/:id', getBookingById);
router.put('/:id/cancel', (req, res) => {
    req.body.status = 'cancelled';
    updateBookingStatus(req, res);
});
router.put('/:id/reschedule', rescheduleBooking);

// ==================== TRAINER ROUTES ====================
router.get('/trainer/:trainerId', trainerMiddleware, getTrainerBookings);
router.put('/:id/complete', trainerMiddleware, (req, res) => {
    req.body.status = 'completed';
    updateBookingStatus(req, res);
});
router.post('/availability', trainerMiddleware, createAvailabilitySlots);

// ==================== ADMIN ONLY ROUTES ====================
router.get('/', adminMiddleware, getAllBookings);
router.get('/:id/history', adminMiddleware, getBookingHistory);
router.put('/:id/status', adminMiddleware, updateBookingStatus);
router.put('/:id/confirm', adminMiddleware, (req, res) => {
    req.body.status = 'confirmed';
    updateBookingStatus(req, res);
});
router.put('/:id/no-show', adminMiddleware, (req, res) => {
    req.body.status = 'no-show';
    updateBookingStatus(req, res);
});
router.delete('/:id', adminMiddleware, deleteBooking);

export default router;
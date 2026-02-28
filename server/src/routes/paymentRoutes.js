// server/src/routes/paymentRoutes.js
import express from 'express';
import {
  getMyPaymentHistory,
  getMyPaymentByReference,
  getAllPayments,
  getPaymentById,
  getPaymentStats
} from '../controllers/paymentController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// ==================== PROTECTED ROUTES (Member) ====================
// All routes require authentication

/**
 * @route   GET /api/payments/my-history
 * @desc    Get current user's payment history
 * @access  Private
 */
router.get('/my-history', authMiddleware, getMyPaymentHistory);

/**
 * @route   GET /api/payments/my/:reference
 * @desc    Get specific payment by reference (member view)
 * @access  Private
 */
router.get('/my/:reference', authMiddleware, getMyPaymentByReference);

// ==================== ADMIN ONLY ROUTES ====================

/**
 * @route   GET /api/payments/admin/all
 * @desc    Get all payments with filters (admin)
 * @access  Private (Admin only)
 */
router.get('/admin/all', authMiddleware, adminMiddleware, getAllPayments);

/**
 * @route   GET /api/payments/admin/stats
 * @desc    Get payment statistics (admin)
 * @access  Private (Admin only)
 */
router.get('/admin/stats', authMiddleware, adminMiddleware, getPaymentStats);

/**
 * @route   GET /api/payments/admin/:id
 * @desc    Get payment by ID (admin view)
 * @access  Private (Admin only)
 */
router.get('/admin/:id', authMiddleware, adminMiddleware, getPaymentById);

export default router;
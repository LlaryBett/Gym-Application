import express from 'express';
import {
  getDashboardStats,
  getRecentMembers,
  getPopularPrograms,
  getRevenueReport,
  getMemberGrowthReport,
  getOverviewStats,
  getTrainerPerformance,
  getBookingTrends,
  getMembershipDistribution,
  getPeakHours,
  getRetentionRate
} from '../controllers/adminController.js';

// Import member controller functions - ONLY USE EXPORTED FUNCTIONS
import {
  getAllMembers,
  getMemberById,
  updateMember,
  deleteMember,
  getMemberStats
} from '../controllers/memberController.js';

// Import trainer controller functions
import {
  getAllTrainers,
  getTrainerById,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  getSpecialties,
  getTrainerStats
} from '../controllers/trainersController.js';

const router = express.Router();

// ==================== DASHBOARD ROUTES ====================
router.get('/dashboard/stats', getDashboardStats);
router.get('/members/recent', getRecentMembers);
router.get('/programs/popular', getPopularPrograms);
router.post('/programs/popular', getPopularPrograms);

// ==================== REPORT ROUTES ====================
// GET routes
router.get('/reports/revenue', getRevenueReport);
router.get('/reports/member-growth', getMemberGrowthReport);
router.get('/reports/membership-distribution', getMembershipDistribution);
router.get('/reports/peak-hours', getPeakHours);
router.get('/reports/retention-rate', getRetentionRate);

// POST routes (for dateRange)
router.post('/reports/overview-stats', getOverviewStats);
router.post('/reports/revenue', getRevenueReport);
router.post('/reports/member-growth', getMemberGrowthReport);
router.post('/reports/trainer-performance', getTrainerPerformance);
router.post('/reports/booking-trends', getBookingTrends);

// ==================== MEMBER MANAGEMENT ROUTES ====================
/**
 * @route   GET /api/admin/members
 * @desc    Get all members with filters
 * @access  Private (Admin only)
 */
router.get('/members', getAllMembers);

/**
 * @route   GET /api/admin/members/:id
 * @desc    Get member by ID
 * @access  Private (Admin only)
 */
router.get('/members/:id', getMemberById);

/**
 * @route   PUT /api/admin/members/:id
 * @desc    Update member
 * @access  Private (Admin only)
 */
router.put('/members/:id', updateMember);

/**
 * @route   DELETE /api/admin/members/:id
 * @desc    Delete a member
 * @access  Private (Admin only)
 */
router.delete('/members/:id', deleteMember);

/**
 * @route   GET /api/admin/members/stats
 * @desc    Get member statistics
 * @access  Private (Admin only)
 */
router.get('/members/stats', getMemberStats);

// ==================== TRAINER MANAGEMENT ROUTES ====================
/**
 * @route   GET /api/admin/trainers
 * @desc    Get all trainers with filters (admin version)
 * @access  Private (Admin only)
 */
router.get('/trainers', getAllTrainers);

/**
 * @route   GET /api/admin/trainers/specialties
 * @desc    Get all trainer specialties
 * @access  Private (Admin only)
 */
router.get('/trainers/specialties', getSpecialties);

/**
 * @route   GET /api/admin/trainers/stats
 * @desc    Get trainer statistics
 * @access  Private (Admin only)
 */
router.get('/trainers/stats', getTrainerStats);

/**
 * @route   GET /api/admin/trainers/:id
 * @desc    Get trainer by ID
 * @access  Private (Admin only)
 */
router.get('/trainers/:id', getTrainerById);

/**
 * @route   POST /api/admin/trainers
 * @desc    Create a new trainer
 * @access  Private (Admin only)
 */
router.post('/trainers', createTrainer);

/**
 * @route   PUT /api/admin/trainers/:id
 * @desc    Update an existing trainer
 * @access  Private (Admin only)
 */
router.put('/trainers/:id', updateTrainer);

/**
 * @route   DELETE /api/admin/trainers/:id
 * @desc    Delete a trainer (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/trainers/:id', deleteTrainer);

export default router;
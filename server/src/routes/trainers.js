import express from 'express';
import {
  getAllTrainers,
  getTrainerById,
  createTrainer,
  updateTrainer,
  deleteTrainer,
  getFeaturedTrainers,
  getTrainersBySpecialty,
  getSpecialties,
  getTrainerStats
} from '../controllers/trainersController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// These routes do NOT require authentication
// Anyone can view trainers, specialties, and stats

/**
 * @route   GET /api/trainers
 * @desc    Get all trainers with optional filters and pagination
 * @access  Public
 */
router.get('/', getAllTrainers);

/**
 * @route   GET /api/trainers/featured
 * @desc    Get featured trainers for homepage
 * @access  Public
 */
router.get('/featured', getFeaturedTrainers);

/**
 * @route   GET /api/trainers/specialties
 * @desc    Get all available trainer specialties
 * @access  Public
 */
router.get('/specialties', getSpecialties);

/**
 * @route   GET /api/trainers/specialty/:specialty
 * @desc    Get trainers by specialty
 * @access  Public
 */
router.get('/specialty/:specialty', getTrainersBySpecialty);

/**
 * @route   GET /api/trainers/stats
 * @desc    Get trainer statistics (total trainers, by specialty, etc.)
 * @access  Public
 */
router.get('/stats', getTrainerStats);

/**
 * @route   GET /api/trainers/:id
 * @desc    Get a single trainer by ID
 * @access  Public
 */
router.get('/:id', getTrainerById);

// ==================== PROTECTED ROUTES ====================
// These routes require authentication AND admin privileges

/**
 * @route   POST /api/trainers
 * @desc    Create a new trainer
 * @access  Private (Admin only)
 */
router.post('/', authMiddleware, adminMiddleware, createTrainer);

/**
 * @route   PUT /api/trainers/:id
 * @desc    Update an existing trainer
 * @access  Private (Admin only)
 */
router.put('/:id', authMiddleware, adminMiddleware, updateTrainer);

/**
 * @route   DELETE /api/trainers/:id
 * @desc    Delete a trainer (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/:id', authMiddleware, adminMiddleware, deleteTrainer);

export default router;
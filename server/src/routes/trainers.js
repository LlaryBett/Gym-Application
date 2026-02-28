import express from 'express';
import {
  getAllTrainers,
  getTrainerById,
  getFeaturedTrainers,
  getTrainersBySpecialty,
  getSpecialties,
  getTrainerStats
} from '../controllers/trainersController.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// These routes do NOT require authentication

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
 * @desc    Get trainer statistics
 * @access  Public
 */
router.get('/stats', getTrainerStats);

/**
 * @route   GET /api/trainers/:id
 * @desc    Get a single trainer by ID
 * @access  Public
 */
router.get('/:id', getTrainerById);

export default router;
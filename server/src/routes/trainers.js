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

// Public routes
router.get('/', getAllTrainers);
router.get('/featured', getFeaturedTrainers);
router.get('/specialties', getSpecialties);
router.get('/specialty/:specialty', getTrainersBySpecialty);
router.get('/stats', getTrainerStats);
router.get('/:id', getTrainerById);

// Protected routes (admin only)
router.post('/', authMiddleware, adminMiddleware, createTrainer);
router.put('/:id', authMiddleware, adminMiddleware, updateTrainer);
router.delete('/:id', authMiddleware, adminMiddleware, deleteTrainer);

export default router;
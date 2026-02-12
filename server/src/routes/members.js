import express from 'express';
import {
  getAllMembers,
  getMemberById,
  updateMember,
  deleteMember,
  getMemberStats
} from '../controllers/memberController.js';
import { adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Member management routes (protected)
router.get('/', adminMiddleware, getAllMembers);
router.get('/stats', adminMiddleware, getMemberStats);
router.get('/:id', getMemberById);
router.put('/:id', updateMember);
router.delete('/:id', adminMiddleware, deleteMember);

export default router;
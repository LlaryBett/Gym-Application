// server/src/routes/cardRoutes.js
import express from 'express';
import {
  issueMembershipCard,
  getMyCard,
  getFullCardDetails
} from '../controllers/cardController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All card routes require authentication
router.use(authMiddleware);

router.post('/issue', issueMembershipCard);
router.get('/my-card', getMyCard);
router.get('/full-details', getFullCardDetails);

export default router;
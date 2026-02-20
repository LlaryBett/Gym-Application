import express from 'express';
import { 
  registerMember, 
  login, 
  logout, 
  getCurrentUser,
   forgotMembershipNumber  // Add this import
} from '../controllers/authController.js';
import { loginLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public auth routes
router.post('/register', registerMember);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.get('/me', getCurrentUser);
router.post('/forgot-membership', forgotMembershipNumber);

export default router;
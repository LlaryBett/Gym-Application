import express from 'express';
import {
    // Public routes
    getAllPlans,
    getPlanById,
    
    // Member routes (require auth)
    purchaseMembership,
    getMyMembership,
    getMyMembershipHistory,
    cancelMembership,
    toggleAutoRenew,
    changePlan,
    
    // Paystack routes
    handlePaymentCallback,
    handlePaystackWebhook,
    
    // Admin routes
    createPlan,
    updatePlan,
    deletePlan,
    getAllActiveMemberships,
    getMembershipStats,
    processRenewals
} from '../controllers/membershipController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
router.get('/plans', getAllPlans);
router.get('/plans/:id', getPlanById);

// ==================== PAYSTACK ROUTES (PUBLIC) ====================
// These must be public - no auth middleware
router.get('/callback', handlePaymentCallback);
router.post('/webhook', handlePaystackWebhook);

// ==================== PROTECTED ROUTES (Require Auth) ====================
router.use(authMiddleware);

// Member's own memberships
router.post('/purchase', purchaseMembership);
router.get('/my-membership', getMyMembership);
router.get('/my-history', getMyMembershipHistory);
router.put('/:id/cancel', cancelMembership);
router.put('/:id/toggle-renew', toggleAutoRenew);
router.put('/:id/change-plan', changePlan);

// ==================== ADMIN ONLY ROUTES ====================
router.post('/plans', adminMiddleware, createPlan);
router.put('/plans/:id', adminMiddleware, updatePlan);
router.delete('/plans/:id', adminMiddleware, deletePlan);
router.get('/admin/memberships', adminMiddleware, getAllActiveMemberships);
router.get('/admin/stats', adminMiddleware, getMembershipStats);
router.post('/admin/process-renewals', adminMiddleware, processRenewals);

export default router;
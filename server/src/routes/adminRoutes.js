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
  getMemberStats,
  suspendMember,
  reactivateMember
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
 * @route   PUT /api/admin/members/:id/suspend
 * @desc    Suspend a member with reason
 * @access  Private (Admin only)
 */
router.put('/members/:id/suspend', suspendMember);

/**
 * @route   PUT /api/admin/members/:id/reactivate
 * @desc    Reactivate a suspended member
 * @access  Private (Admin only)
 */
router.put('/members/:id/reactivate', reactivateMember);

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

// ==================== SETTINGS ROUTES ====================
/**
 * @route   GET /api/admin/settings
 * @desc    Get all admin settings
 * @access  Private (Admin only)
 */
router.get('/settings', (req, res) => {
  res.json({
    success: true,
    data: {
      general: {
        gymName: 'PowerGym',
        gymEmail: 'info@powergym.com',
        gymPhone: '+254 712 345 678',
        gymAddress: '123 Fitness Street, Workout City',
        timezone: 'Africa/Nairobi',
        currency: 'KES',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h'
      },
      appearance: {
        primaryColor: '#f97316',
        secondaryColor: '#000000',
        logo: '/logo.png',
        favicon: '/favicon.ico',
        theme: 'light',
        accentColor: '#facc15',
        fontFamily: 'Inter'
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: false,
        bookingReminders: true,
        membershipExpiry: true,
        paymentReceipts: true,
        promotionalEmails: false,
        adminAlerts: true
      },
      email: {
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpSecure: true,
        smtpUser: 'noreply@powergym.com',
        smtpPassword: '********',
        fromEmail: 'noreply@powergym.com',
        fromName: 'PowerGym',
        replyTo: 'support@powergym.com'
      },
      payment: {
        provider: 'paystack',
        paystackPublicKey: 'pk_test_...',
        paystackSecretKey: 'sk_test_...',
        currency: 'KES',
        taxRate: 16,
        depositRequired: false,
        depositPercentage: 50,
        autoRenew: true,
        gracePeriod: 3
      },
      membership: {
        trialDays: 7,
        maxMembers: 1000,
        allowCancellation: true,
        cancellationNotice: 30,
        freezeAllowed: true,
        maxFreezeDays: 60,
        autoApprove: false,
        requirePayment: true
      },
      bookings: {
        maxAdvanceDays: 30,
        minNoticeHours: 2,
        maxPerDay: 3,
        allowCancellation: true,
        cancellationHours: 24,
        allowRescheduling: true,
        rescheduleFee: 0,
        noShowFee: 500
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordExpiry: 90,
        maxLoginAttempts: 5,
        lockoutDuration: 15,
        ipWhitelist: [],
        allowedDomains: ['powergym.com'],
        requireStrongPassword: true
      },
      integrations: {
        googleAnalytics: ''
      },
      system: {
        logLevel: 'info',
        cacheDuration: 3600,
        backupFrequency: 'daily',
        backupTime: '02:00',
        maintenanceMessage: 'The system is under maintenance. Please try again later.',
        maintenance: false,
        cacheEnabled: true
      }
    }
  });
});

/**
 * @route   PUT /api/admin/settings
 * @desc    Update admin settings
 * @access  Private (Admin only)
 */
router.put('/settings', (req, res) => {
  const { general, branding, membership, booking, notifications, security } = req.body;
  
  // Here you would validate and save the settings to database
  res.json({
    success: true,
    message: 'Settings updated successfully',
    data: {
      general,
      branding,
      membership,
      booking,
      notifications,
      security,
      updatedAt: new Date().toISOString()
    }
  });
});

export default router;
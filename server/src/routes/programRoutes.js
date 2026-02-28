import express from 'express';
import {
    // Public routes
    getAllPrograms,
    getProgramById,
    getFeaturedPrograms,
    getProgramsByCategory,
    getScheduleByDay,
    getAllSchedules,
    getProgramCategories,
    
    // Member routes (require auth)
    enrollInProgram,
    getMyEnrollments,
    saveProgram,
    unsaveProgram,
    getMySavedPrograms,
    
    // Admin routes
    createProgram,
    updateProgram,
    deleteProgram,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getProgramStats,
    
    // Admin - New feature routes
    addGalleryImage,
    removeGalleryImage,
    addCurriculumWeek,
    updateCurriculumWeek,
    removeCurriculumWeek,
    addFaq,
    updateFaq,
    removeFaq,
    addStartDate,
    updateStartDate,
    removeStartDate,
    addRelatedProgram,
    removeRelatedProgram,
    addUpgradeOption,
    removeUpgradeOption
} from '../controllers/programController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// These routes do NOT require authentication

/**
 * @route   GET /api/programs
 * @desc    Get all programs with optional filters and pagination
 * @access  Public
 */
router.get('/', getAllPrograms);

/**
 * @route   GET /api/programs/featured
 * @desc    Get featured programs for homepage
 * @access  Public
 */
router.get('/featured', getFeaturedPrograms);

/**
 * @route   GET /api/programs/categories
 * @desc    Get all program categories
 * @access  Public
 */
router.get('/categories', getProgramCategories);

/**
 * @route   GET /api/programs/schedules
 * @desc    Get all program schedules
 * @access  Public
 */
router.get('/schedules', getAllSchedules);

/**
 * @route   GET /api/programs/schedules/:day
 * @desc    Get schedule by specific day
 * @access  Public
 */
router.get('/schedules/:day', getScheduleByDay);

/**
 * @route   GET /api/programs/category/:category
 * @desc    Get programs by category
 * @access  Public
 */
router.get('/category/:category', getProgramsByCategory);

/**
 * @route   GET /api/programs/stats
 * @desc    Get program statistics
 * @access  Public
 */
router.get('/stats', getProgramStats);

// ==================== PROTECTED ROUTES (Require Authentication) ====================
// These specific routes MUST come before the dynamic /:id route

/**
 * @route   GET /api/programs/my-enrollments
 * @desc    Get current user's program enrollments
 * @access  Private
 */
router.get('/my-enrollments', authMiddleware, getMyEnrollments);

/**
 * @route   GET /api/programs/my/saved
 * @desc    Get current user's saved programs (wishlist)
 * @access  Private
 */
router.get('/my/saved', authMiddleware, getMySavedPrograms);

/**
 * @route   POST /api/programs/enroll
 * @desc    Enroll in a program
 * @access  Private (Any authenticated user)
 */
router.post('/enroll', authMiddleware, enrollInProgram);

/**
 * @route   POST /api/programs/:id/save
 * @desc    Save a program to user's wishlist
 * @access  Private
 */
router.post('/:id/save', authMiddleware, saveProgram);

/**
 * @route   DELETE /api/programs/:id/save
 * @desc    Remove a program from user's wishlist
 * @access  Private
 */
router.delete('/:id/save', authMiddleware, unsaveProgram);

// ==================== DYNAMIC ROUTE ====================
// THIS MUST COME AFTER ALL SPECIFIC ROUTES
/**
 * @route   GET /api/programs/:id
 * @desc    Get a single program by ID
 * @access  Public
 */
router.get('/:id', getProgramById);

// ==================== ADMIN ONLY ROUTES ====================
// All routes after this require authentication AND admin privileges

// ===== Program Management =====
/**
 * @route   POST /api/programs
 * @desc    Create a new program
 * @access  Private (Admin only)
 */
router.post('/', authMiddleware, adminMiddleware, createProgram);

/**
 * @route   PUT /api/programs/:id
 * @desc    Update an existing program
 * @access  Private (Admin only)
 */
router.put('/:id', authMiddleware, adminMiddleware, updateProgram);

/**
 * @route   DELETE /api/programs/:id
 * @desc    Delete a program (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/:id', authMiddleware, adminMiddleware, deleteProgram);

// ===== Schedule Management =====
/**
 * @route   POST /api/programs/schedules
 * @desc    Create a new schedule
 * @access  Private (Admin only)
 */
router.post('/schedules', authMiddleware, adminMiddleware, createSchedule);

/**
 * @route   PUT /api/programs/schedules/:id
 * @desc    Update a schedule
 * @access  Private (Admin only)
 */
router.put('/schedules/:id', authMiddleware, adminMiddleware, updateSchedule);

/**
 * @route   DELETE /api/programs/schedules/:id
 * @desc    Delete a schedule
 * @access  Private (Admin only)
 */
router.delete('/schedules/:id', authMiddleware, adminMiddleware, deleteSchedule);

// ===== Gallery Management =====
/**
 * @route   POST /api/programs/:programId/gallery
 * @desc    Add an image to program gallery
 * @access  Private (Admin only)
 */
router.post('/:programId/gallery', authMiddleware, adminMiddleware, addGalleryImage);

/**
 * @route   DELETE /api/programs/gallery/:imageId
 * @desc    Remove an image from program gallery
 * @access  Private (Admin only)
 */
router.delete('/gallery/:imageId', authMiddleware, adminMiddleware, removeGalleryImage);

// ===== Curriculum Management =====
/**
 * @route   POST /api/programs/:programId/curriculum
 * @desc    Add a curriculum week to a program
 * @access  Private (Admin only)
 */
router.post('/:programId/curriculum', authMiddleware, adminMiddleware, addCurriculumWeek);

/**
 * @route   PUT /api/programs/curriculum/:id
 * @desc    Update a curriculum week
 * @access  Private (Admin only)
 */
router.put('/curriculum/:id', authMiddleware, adminMiddleware, updateCurriculumWeek);

/**
 * @route   DELETE /api/programs/curriculum/:id
 * @desc    Remove a curriculum week
 * @access  Private (Admin only)
 */
router.delete('/curriculum/:id', authMiddleware, adminMiddleware, removeCurriculumWeek);

// ===== FAQ Management =====
/**
 * @route   POST /api/programs/:programId/faqs
 * @desc    Add an FAQ to a program
 * @access  Private (Admin only)
 */
router.post('/:programId/faqs', authMiddleware, adminMiddleware, addFaq);

/**
 * @route   PUT /api/programs/faqs/:id
 * @desc    Update an FAQ
 * @access  Private (Admin only)
 */
router.put('/faqs/:id', authMiddleware, adminMiddleware, updateFaq);

/**
 * @route   DELETE /api/programs/faqs/:id
 * @desc    Remove an FAQ
 * @access  Private (Admin only)
 */
router.delete('/faqs/:id', authMiddleware, adminMiddleware, removeFaq);

// ===== Start Dates Management =====
/**
 * @route   POST /api/programs/:programId/start-dates
 * @desc    Add a start date to a program
 * @access  Private (Admin only)
 */
router.post('/:programId/start-dates', authMiddleware, adminMiddleware, addStartDate);

/**
 * @route   PUT /api/programs/start-dates/:id
 * @desc    Update a start date (spots available)
 * @access  Private (Admin only)
 */
router.put('/start-dates/:id', authMiddleware, adminMiddleware, updateStartDate);

/**
 * @route   DELETE /api/programs/start-dates/:id
 * @desc    Remove a start date
 * @access  Private (Admin only)
 */
router.delete('/start-dates/:id', authMiddleware, adminMiddleware, removeStartDate);

// ===== Related Programs Management =====
/**
 * @route   POST /api/programs/:programId/related
 * @desc    Add a related program
 * @access  Private (Admin only)
 */
router.post('/:programId/related', authMiddleware, adminMiddleware, addRelatedProgram);

/**
 * @route   DELETE /api/programs/:programId/related/:relatedProgramId
 * @desc    Remove a related program
 * @access  Private (Admin only)
 */
router.delete('/:programId/related/:relatedProgramId', authMiddleware, adminMiddleware, removeRelatedProgram);

// ===== Upgrade Options Management =====
/**
 * @route   POST /api/programs/:programId/upgrades
 * @desc    Add an upgrade option to a program
 * @access  Private (Admin only)
 */
router.post('/:programId/upgrades', authMiddleware, adminMiddleware, addUpgradeOption);

/**
 * @route   DELETE /api/programs/:programId/upgrades/:upgradeProgramId
 * @desc    Remove an upgrade option
 * @access  Private (Admin only)
 */
router.delete('/:programId/upgrades/:upgradeProgramId', authMiddleware, adminMiddleware, removeUpgradeOption);

export default router;
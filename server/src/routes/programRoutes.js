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
// 🔴 SPECIFIC ROUTES MUST COME BEFORE DYNAMIC /:id ROUTE
router.get('/', getAllPrograms);
router.get('/featured', getFeaturedPrograms);
router.get('/categories', getProgramCategories);
router.get('/schedules', getAllSchedules);
router.get('/schedules/:day', getScheduleByDay);
router.get('/category/:category', getProgramsByCategory);
router.get('/stats', getProgramStats);

// ==================== PROTECTED ROUTES (Require Auth) ====================
router.use(authMiddleware);

// ✅ MEMBER ENROLLMENT ROUTES - BEFORE /:id
router.post('/enroll', enrollInProgram);
router.get('/my-enrollments', getMyEnrollments);
router.get('/my/saved', getMySavedPrograms);

// ✅ SAVED PROGRAMS - THESE USE :ID BUT ARE PROTECTED
router.post('/:id/save', saveProgram);
router.delete('/:id/save', unsaveProgram);

// ==================== DYNAMIC PROGRAM ID ROUTE ====================
// 🔴 THIS MUST COME AFTER ALL SPECIFIC ROUTES
router.get('/:id', getProgramById);

// ==================== ADMIN ONLY ROUTES ====================
// Program management
router.post('/', adminMiddleware, createProgram);
router.put('/:id', adminMiddleware, updateProgram);
router.delete('/:id', adminMiddleware, deleteProgram);

// Schedule management
router.post('/schedules', adminMiddleware, createSchedule);
router.put('/schedules/:id', adminMiddleware, updateSchedule);
router.delete('/schedules/:id', adminMiddleware, deleteSchedule);

// Gallery management
router.post('/:programId/gallery', adminMiddleware, addGalleryImage);
router.delete('/gallery/:imageId', adminMiddleware, removeGalleryImage);

// Curriculum management
router.post('/:programId/curriculum', adminMiddleware, addCurriculumWeek);
router.put('/curriculum/:id', adminMiddleware, updateCurriculumWeek);
router.delete('/curriculum/:id', adminMiddleware, removeCurriculumWeek);

// FAQ management
router.post('/:programId/faqs', adminMiddleware, addFaq);
router.put('/faqs/:id', adminMiddleware, updateFaq);
router.delete('/faqs/:id', adminMiddleware, removeFaq);

// Start dates management
router.post('/:programId/start-dates', adminMiddleware, addStartDate);
router.put('/start-dates/:id', adminMiddleware, updateStartDate);
router.delete('/start-dates/:id', adminMiddleware, removeStartDate);

// Related programs management
router.post('/:programId/related', adminMiddleware, addRelatedProgram);
router.delete('/:programId/related/:relatedProgramId', adminMiddleware, removeRelatedProgram);

// Upgrade options management
router.post('/:programId/upgrades', adminMiddleware, addUpgradeOption);
router.delete('/:programId/upgrades/:upgradeProgramId', adminMiddleware, removeUpgradeOption);

export default router;
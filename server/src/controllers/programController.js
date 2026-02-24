import Program from '../models/Program.js';
import { programSchemas } from '../utils/validation.js';

// ==================== PUBLIC ROUTES ====================

// Get all programs
export const getAllPrograms = async (req, res) => {
    try {
        const { error, value } = programSchemas.getAll.validate(req.query);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map(detail => detail.message)
            });
        }

        const { page, limit, category, featured, search } = value;
        const filters = { category, featured, search };
        
        const result = await Program.findAll(page, limit, filters);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get programs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch programs'
        });
    }
};

// Get program by ID with all related data
export const getProgramById = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id);

        if (!program) {
            return res.status(404).json({
                success: false,
                message: 'Program not found'
            });
        }

        // ✅ FIXED: Use req.user from JWT instead of req.session
        let isSaved = false;
        if (req.user?.id) {
            isSaved = await Program.isProgramSaved(req.user.id, parseInt(req.params.id));
        }

        res.json({
            success: true,
            data: {
                ...program,
                isSaved
            }
        });
    } catch (error) {
        console.error('Get program error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch program'
        });
    }
};

// Get featured programs
export const getFeaturedPrograms = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 4;
        const programs = await Program.getFeatured(limit);

        res.json({
            success: true,
            data: programs
        });
    } catch (error) {
        console.error('Get featured programs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured programs'
        });
    }
};

// Get programs by category
export const getProgramsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        
        const result = await Program.findByCategory(category, page, limit);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get programs by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch programs by category'
        });
    }
};

// ==================== CLASS SCHEDULE ====================

// Get schedule by day
export const getScheduleByDay = async (req, res) => {
    try {
        const { day } = req.params;
        const schedule = await Program.getScheduleByDay(day);

        res.json({
            success: true,
            data: schedule
        });
    } catch (error) {
        console.error('Get schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch schedule'
        });
    }
};

// Get all schedules
export const getAllSchedules = async (req, res) => {
    try {
        const schedules = await Program.getAllSchedules();

        res.json({
            success: true,
            data: schedules
        });
    } catch (error) {
        console.error('Get all schedules error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch schedules'
        });
    }
};

// ==================== PROGRAM CATEGORIES ====================

// Get all program categories
export const getProgramCategories = async (req, res) => {
    try {
        const categories = await Program.getCategories();

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories'
        });
    }
};

// ==================== ENROLLMENTS ====================

// Enroll in program
export const enrollInProgram = async (req, res) => {
    try {
        const { error, value } = programSchemas.enroll.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map(detail => detail.message)
            });
        }

        // ✅ FIXED: Use req.user from JWT
        const memberId = req.user.id;
        const { program_id } = value;

        const enrollment = await Program.enroll(memberId, program_id);

        res.status(201).json({
            success: true,
            message: 'Successfully enrolled in program',
            data: enrollment
        });
    } catch (error) {
        console.error('Enroll error:', error);
        
        if (error.message === 'Already enrolled in this program') {
            return res.status(409).json({
                success: false,
                message: 'Already enrolled in this program'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to enroll in program'
        });
    }
};

// Get my enrollments
export const getMyEnrollments = async (req, res) => {
  try {
    console.log('========== GET MY ENROLLMENTS ==========');
    console.log('JWT User:', req.user);
    
    // ✅ FIXED: Use req.user from JWT
    if (!req.user?.id) {
      console.log('❌ No user ID in JWT');
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const memberId = req.user.id;
    console.log('Fetching enrollments for member ID:', memberId);
    
    const enrollments = await Program.getMemberEnrollments(memberId);
    console.log('Raw enrollments from model:', enrollments);
    
    console.log('✅ Successfully fetched enrollments');
    console.log('========================================');
    
    res.json({
      success: true,
      data: enrollments || []
    });
    
  } catch (error) {
    console.error('❌ ERROR in getMyEnrollments:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ==================== SAVED PROGRAMS (WISHLIST) ====================

// Save program
export const saveProgram = async (req, res) => {
    try {
        // ✅ FIXED: Use req.user from JWT
        const memberId = req.user.id;
        const programId = parseInt(req.params.id);

        console.log(`Saving program ${programId} for user ${memberId}`);

        const saved = await Program.saveProgram(memberId, programId);

        res.json({
            success: true,
            message: 'Program saved successfully',
            data: { saved: !!saved }
        });
    } catch (error) {
        console.error('Save program error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save program'
        });
    }
};

// Unsave program
export const unsaveProgram = async (req, res) => {
    try {
        // ✅ FIXED: Use req.user from JWT
        const memberId = req.user.id;
        const programId = parseInt(req.params.id);

        const unsaved = await Program.unsaveProgram(memberId, programId);

        res.json({
            success: true,
            message: 'Program removed from saved',
            data: { unsaved: !!unsaved }
        });
    } catch (error) {
        console.error('Unsave program error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unsave program'
        });
    }
};

// Get my saved programs
export const getMySavedPrograms = async (req, res) => {
    try {
        // ✅ FIXED: Use req.user from JWT
        const memberId = req.user.id;
        const programs = await Program.getSavedPrograms(memberId);

        res.json({
            success: true,
            data: programs
        });
    } catch (error) {
        console.error('Get saved programs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch saved programs'
        });
    }
};

// ==================== ADMIN ROUTES ====================

// Create program (admin)
export const createProgram = async (req, res) => {
    try {
        const { error, value } = programSchemas.create.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map(detail => detail.message)
            });
        }

        const program = await Program.create(value);

        res.status(201).json({
            success: true,
            message: 'Program created successfully',
            data: program
        });
    } catch (error) {
        console.error('Create program error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create program'
        });
    }
};

// Update program (admin)
export const updateProgram = async (req, res) => {
    try {
        const { error, value } = programSchemas.update.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map(detail => detail.message)
            });
        }

        const program = await Program.update(req.params.id, value);

        if (!program) {
            return res.status(404).json({
                success: false,
                message: 'Program not found'
            });
        }

        res.json({
            success: true,
            message: 'Program updated successfully',
            data: program
        });
    } catch (error) {
        console.error('Update program error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update program'
        });
    }
};

// Delete program (admin)
export const deleteProgram = async (req, res) => {
    try {
        const program = await Program.delete(req.params.id);

        if (!program) {
            return res.status(404).json({
                success: false,
                message: 'Program not found'
            });
        }

        res.json({
            success: true,
            message: 'Program deleted successfully',
            data: {
                id: program.id,
                title: program.title
            }
        });
    } catch (error) {
        console.error('Delete program error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete program'
        });
    }
};

// ==================== GALLERY MANAGEMENT (ADMIN) ====================

// Add gallery image
export const addGalleryImage = async (req, res) => {
    try {
        const { programId } = req.params;
        const { image_url, caption, display_order } = req.body;

        const image = await Program.addGalleryImage(programId, image_url, caption, display_order);

        res.status(201).json({
            success: true,
            message: 'Gallery image added successfully',
            data: image
        });
    } catch (error) {
        console.error('Add gallery image error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add gallery image'
        });
    }
};

// Remove gallery image
export const removeGalleryImage = async (req, res) => {
    try {
        const { imageId } = req.params;
        const image = await Program.removeGalleryImage(imageId);

        res.json({
            success: true,
            message: 'Gallery image removed successfully',
            data: image
        });
    } catch (error) {
        console.error('Remove gallery image error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove gallery image'
        });
    }
};

// ==================== CURRICULUM MANAGEMENT (ADMIN) ====================

// Add curriculum week
export const addCurriculumWeek = async (req, res) => {
    try {
        const { programId } = req.params;
        const { week_number, week_title, topics } = req.body;

        const curriculum = await Program.addCurriculumWeek(programId, week_number, week_title, topics);

        res.status(201).json({
            success: true,
            message: 'Curriculum week added successfully',
            data: curriculum
        });
    } catch (error) {
        console.error('Add curriculum week error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add curriculum week'
        });
    }
};

// Update curriculum week
export const updateCurriculumWeek = async (req, res) => {
    try {
        const { id } = req.params;
        const curriculum = await Program.updateCurriculumWeek(id, req.body);

        res.json({
            success: true,
            message: 'Curriculum week updated successfully',
            data: curriculum
        });
    } catch (error) {
        console.error('Update curriculum week error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update curriculum week'
        });
    }
};

// Remove curriculum week
export const removeCurriculumWeek = async (req, res) => {
    try {
        const { id } = req.params;
        const curriculum = await Program.removeCurriculumWeek(id);

        res.json({
            success: true,
            message: 'Curriculum week removed successfully',
            data: curriculum
        });
    } catch (error) {
        console.error('Remove curriculum week error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove curriculum week'
        });
    }
};

// ==================== FAQ MANAGEMENT (ADMIN) ====================

// Add FAQ
export const addFaq = async (req, res) => {
    try {
        const { programId } = req.params;
        const { question, answer, display_order } = req.body;

        const faq = await Program.addFaq(programId, question, answer, display_order);

        res.status(201).json({
            success: true,
            message: 'FAQ added successfully',
            data: faq
        });
    } catch (error) {
        console.error('Add FAQ error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add FAQ'
        });
    }
};

// Update FAQ
export const updateFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const faq = await Program.updateFaq(id, req.body);

        res.json({
            success: true,
            message: 'FAQ updated successfully',
            data: faq
        });
    } catch (error) {
        console.error('Update FAQ error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update FAQ'
        });
    }
};

// Remove FAQ
export const removeFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const faq = await Program.removeFaq(id);

        res.json({
            success: true,
            message: 'FAQ removed successfully',
            data: faq
        });
    } catch (error) {
        console.error('Remove FAQ error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove FAQ'
        });
    }
};

// ==================== START DATES MANAGEMENT (ADMIN) ====================

// Add start date
export const addStartDate = async (req, res) => {
    try {
        const { programId } = req.params;
        const { start_date, spots_available, total_spots } = req.body;

        const startDate = await Program.addStartDate(programId, start_date, spots_available, total_spots);

        res.status(201).json({
            success: true,
            message: 'Start date added successfully',
            data: startDate
        });
    } catch (error) {
        console.error('Add start date error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add start date'
        });
    }
};

// Update start date
export const updateStartDate = async (req, res) => {
    try {
        const { id } = req.params;
        const { spots_available } = req.body;

        const startDate = await Program.updateStartDate(id, spots_available);

        res.json({
            success: true,
            message: 'Start date updated successfully',
            data: startDate
        });
    } catch (error) {
        console.error('Update start date error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update start date'
        });
    }
};

// Remove start date
export const removeStartDate = async (req, res) => {
    try {
        const { id } = req.params;
        const startDate = await Program.removeStartDate(id);

        res.json({
            success: true,
            message: 'Start date removed successfully',
            data: startDate
        });
    } catch (error) {
        console.error('Remove start date error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove start date'
        });
    }
};

// ==================== RELATED PROGRAMS MANAGEMENT (ADMIN) ====================

// Add related program
export const addRelatedProgram = async (req, res) => {
    try {
        const { programId } = req.params;
        const { related_program_id, display_order } = req.body;

        const related = await Program.addRelatedProgram(programId, related_program_id, display_order);

        res.status(201).json({
            success: true,
            message: 'Related program added successfully',
            data: related
        });
    } catch (error) {
        console.error('Add related program error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add related program'
        });
    }
};

// Remove related program
export const removeRelatedProgram = async (req, res) => {
    try {
        const { programId, relatedProgramId } = req.params;
        const related = await Program.removeRelatedProgram(programId, relatedProgramId);

        res.json({
            success: true,
            message: 'Related program removed successfully',
            data: related
        });
    } catch (error) {
        console.error('Remove related program error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove related program'
        });
    }
};

// ==================== UPGRADE OPTIONS MANAGEMENT (ADMIN) ====================

// Add upgrade option
export const addUpgradeOption = async (req, res) => {
    try {
        const { programId } = req.params;
        const { upgrade_program_id, badge_text, display_order } = req.body;

        const upgrade = await Program.addUpgradeOption(programId, upgrade_program_id, badge_text, display_order);

        res.status(201).json({
            success: true,
            message: 'Upgrade option added successfully',
            data: upgrade
        });
    } catch (error) {
        console.error('Add upgrade option error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add upgrade option'
        });
    }
};

// Remove upgrade option
export const removeUpgradeOption = async (req, res) => {
    try {
        const { programId, upgradeProgramId } = req.params;
        const upgrade = await Program.removeUpgradeOption(programId, upgradeProgramId);

        res.json({
            success: true,
            message: 'Upgrade option removed successfully',
            data: upgrade
        });
    } catch (error) {
        console.error('Remove upgrade option error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove upgrade option'
        });
    }
};

// ==================== SCHEDULE MANAGEMENT (ADMIN) ====================

// Create schedule
export const createSchedule = async (req, res) => {
    try {
        const { error, value } = programSchemas.schedule.create.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map(detail => detail.message)
            });
        }

        const schedule = await Program.createSchedule(value);

        res.status(201).json({
            success: true,
            message: 'Schedule created successfully',
            data: schedule
        });
    } catch (error) {
        console.error('Create schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create schedule'
        });
    }
};

// Update schedule
export const updateSchedule = async (req, res) => {
    try {
        const { error, value } = programSchemas.schedule.update.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map(detail => detail.message)
            });
        }

        const schedule = await Program.updateSchedule(req.params.id, value);

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        res.json({
            success: true,
            message: 'Schedule updated successfully',
            data: schedule
        });
    } catch (error) {
        console.error('Update schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update schedule'
        });
    }
};

// Delete schedule
export const deleteSchedule = async (req, res) => {
    try {
        const schedule = await Program.deleteSchedule(req.params.id);

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: 'Schedule not found'
            });
        }

        res.json({
            success: true,
            message: 'Schedule deleted successfully',
            data: schedule
        });
    } catch (error) {
        console.error('Delete schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete schedule'
        });
    }
};

// ==================== STATISTICS ====================

// Get program statistics
export const getProgramStats = async (req, res) => {
    try {
        const stats = await Program.getStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Get program stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch program statistics'
        });
    }
};
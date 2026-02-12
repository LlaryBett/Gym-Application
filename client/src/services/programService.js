// programService.js - Frontend Program API Service
import api from './api.js';

export const programAPI = {
    // ===== PUBLIC ROUTES =====
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/programs${query ? `?${query}` : ''}`);
    },
    getById: (id) => api.get(`/programs/${id}`),
    getFeatured: (limit = 4) => api.get(`/programs/featured?limit=${limit}`),
    getByCategory: (category, params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api.get(`/programs/category/${category}${query ? `?${query}` : ''}`);
    },
    getCategories: () => api.get('/programs/categories'),
    getScheduleByDay: (day) => api.get(`/programs/schedules/${day}`),
    getAllSchedules: () => api.get('/programs/schedules'),
    getStats: () => api.get('/programs/stats'),
    
    // ===== MEMBER ROUTES (Auth Required) =====
    enroll: (programId) => api.post('/programs/enroll', { program_id: programId }),
    getMyEnrollments: () => api.get('/programs/my-enrollments'),
    
    // ===== SAVED PROGRAMS (WISHLIST) =====
    saveProgram: (programId) => api.post(`/programs/${programId}/save`),
    unsaveProgram: (programId) => api.delete(`/programs/${programId}/save`),
    getMySavedPrograms: () => api.get('/programs/my/saved'),
    
    // ===== ADMIN ROUTES =====
    // Program management
    create: (programData) => api.post('/programs', programData),
    update: (id, programData) => api.put(`/programs/${id}`, programData),
    delete: (id) => api.delete(`/programs/${id}`),
    
    // Schedule management
    createSchedule: (scheduleData) => api.post('/programs/schedules', scheduleData),
    updateSchedule: (id, scheduleData) => api.put(`/programs/schedules/${id}`, scheduleData),
    deleteSchedule: (id) => api.delete(`/programs/schedules/${id}`),
    
    // ===== GALLERY MANAGEMENT =====
    addGalleryImage: (programId, imageData) => api.post(`/programs/${programId}/gallery`, imageData),
    removeGalleryImage: (imageId) => api.delete(`/programs/gallery/${imageId}`),
    
    // ===== CURRICULUM MANAGEMENT =====
    addCurriculumWeek: (programId, weekData) => api.post(`/programs/${programId}/curriculum`, weekData),
    updateCurriculumWeek: (id, weekData) => api.put(`/programs/curriculum/${id}`, weekData),
    removeCurriculumWeek: (id) => api.delete(`/programs/curriculum/${id}`),
    
    // ===== FAQ MANAGEMENT =====
    addFaq: (programId, faqData) => api.post(`/programs/${programId}/faqs`, faqData),
    updateFaq: (id, faqData) => api.put(`/programs/faqs/${id}`, faqData),
    removeFaq: (id) => api.delete(`/programs/faqs/${id}`),
    
    // ===== START DATES MANAGEMENT =====
    addStartDate: (programId, dateData) => api.post(`/programs/${programId}/start-dates`, dateData),
    updateStartDate: (id, spotsAvailable) => api.put(`/programs/start-dates/${id}`, { spots_available: spotsAvailable }),
    removeStartDate: (id) => api.delete(`/programs/start-dates/${id}`),
    
    // ===== RELATED PROGRAMS MANAGEMENT =====
    addRelatedProgram: (programId, relatedProgramId, displayOrder = 0) => 
        api.post(`/programs/${programId}/related`, { 
            related_program_id: relatedProgramId, 
            display_order: displayOrder 
        }),
    removeRelatedProgram: (programId, relatedProgramId) => 
        api.delete(`/programs/${programId}/related/${relatedProgramId}`),
    
    // ===== UPGRADE OPTIONS MANAGEMENT =====
    addUpgradeOption: (programId, upgradeProgramId, badgeText = '', displayOrder = 0) => 
        api.post(`/programs/${programId}/upgrades`, { 
            upgrade_program_id: upgradeProgramId, 
            badge_text: badgeText, 
            display_order: displayOrder 
        }),
    removeUpgradeOption: (programId, upgradeProgramId) => 
        api.delete(`/programs/${programId}/upgrades/${upgradeProgramId}`)
};

export const programService = {
    // ===== PUBLIC METHODS =====
    getAllPrograms: async (params = {}) => {
        try {
            const response = await programAPI.getAll(params);
            
            if (response.success && response.data?.programs) {
                return {
                    ...response,
                    data: {
                        ...response.data,
                        programs: response.data.programs.map(p => 
                            programService.formatProgramForDisplay(p)
                        )
                    }
                };
            }
            return response;
        } catch (error) {
            console.error('Failed to fetch programs:', error);
            throw error;
        }
    },
    
    getProgramById: async (id) => {
        try {
            const response = await programAPI.getById(id);
            
            if (response.success && response.data) {
                return {
                    ...response,
                    data: programService.formatProgramForDisplay(response.data)
                };
            }
            return response;
        } catch (error) {
            console.error(`Failed to fetch program ${id}:`, error);
            throw error;
        }
    },
    
    getFeaturedPrograms: async (limit = 4) => {
        try {
            const response = await programAPI.getFeatured(limit);
            
            if (response.success && response.data) {
                return {
                    ...response,
                    data: response.data.map(p => 
                        programService.formatProgramForDisplay(p)
                    )
                };
            }
            return response;
        } catch (error) {
            console.error('Failed to fetch featured programs:', error);
            throw error;
        }
    },
    
    getProgramsByCategory: async (category, params = {}) => {
        try {
            const response = await programAPI.getByCategory(category, params);
            
            if (response.success && response.data?.programs) {
                return {
                    ...response,
                    data: {
                        ...response.data,
                        programs: response.data.programs.map(p => 
                            programService.formatProgramForDisplay(p)
                        )
                    }
                };
            }
            return response;
        } catch (error) {
            console.error(`Failed to fetch programs by category ${category}:`, error);
            throw error;
        }
    },
    
    getScheduleByDay: async (day) => {
        try {
            const response = await programAPI.getScheduleByDay(day);
            return response;
        } catch (error) {
            console.error(`Failed to fetch schedule for ${day}:`, error);
            throw error;
        }
    },
    
    getAllSchedules: async () => {
        try {
            const response = await programAPI.getAllSchedules();
            return response;
        } catch (error) {
            console.error('Failed to fetch all schedules:', error);
            throw error;
        }
    },
    
    getCategories: async () => {
        try {
            const response = await programAPI.getCategories();
            return response;
        } catch (error) {
            console.error('Failed to fetch categories:', error);
            throw error;
        }
    },
    
    getStats: async () => {
        try {
            const response = await programAPI.getStats();
            return response;
        } catch (error) {
            console.error('Failed to fetch program stats:', error);
            throw error;
        }
    },
    
    // ===== MEMBER METHODS =====
    enrollInProgram: async (programId) => {
        try {
            const response = await programAPI.enroll(programId);
            return response;
        } catch (error) {
            console.error('Failed to enroll in program:', error);
            throw error;
        }
    },
    
    getMyEnrollments: async () => {
        try {
            const response = await programAPI.getMyEnrollments();
            return response;
        } catch (error) {
            console.error('Failed to fetch my enrollments:', error);
            throw error;
        }
    },
    
    // ===== SAVED PROGRAMS (WISHLIST) =====
    saveProgram: async (programId) => {
        try {
            const response = await programAPI.saveProgram(programId);
            return response;
        } catch (error) {
            console.error('Failed to save program:', error);
            throw error;
        }
    },
    
    unsaveProgram: async (programId) => {
        try {
            const response = await programAPI.unsaveProgram(programId);
            return response;
        } catch (error) {
            console.error('Failed to unsave program:', error);
            throw error;
        }
    },
    
    getMySavedPrograms: async () => {
        try {
            const response = await programAPI.getMySavedPrograms();
            
            if (response.success && response.data) {
                return {
                    ...response,
                    data: response.data.map(p => 
                        programService.formatProgramForDisplay(p)
                    )
                };
            }
            return response;
        } catch (error) {
            console.error('Failed to fetch saved programs:', error);
            throw error;
        }
    },
    
    // ===== ADMIN METHODS =====
    createProgram: async (programData) => {
        try {
            const response = await programAPI.create(programData);
            return response;
        } catch (error) {
            console.error('Failed to create program:', error);
            throw error;
        }
    },
    
    updateProgram: async (id, programData) => {
        try {
            const response = await programAPI.update(id, programData);
            return response;
        } catch (error) {
            console.error(`Failed to update program ${id}:`, error);
            throw error;
        }
    },
    
    deleteProgram: async (id) => {
        try {
            const response = await programAPI.delete(id);
            return response;
        } catch (error) {
            console.error(`Failed to delete program ${id}:`, error);
            throw error;
        }
    },
    
    // ===== GALLERY MANAGEMENT (ADMIN) =====
    addGalleryImage: async (programId, imageUrl, caption = '', displayOrder = 0) => {
        try {
            const response = await programAPI.addGalleryImage(programId, { 
                image_url: imageUrl, 
                caption, 
                display_order: displayOrder 
            });
            return response;
        } catch (error) {
            console.error('Failed to add gallery image:', error);
            throw error;
        }
    },
    
    removeGalleryImage: async (imageId) => {
        try {
            const response = await programAPI.removeGalleryImage(imageId);
            return response;
        } catch (error) {
            console.error('Failed to remove gallery image:', error);
            throw error;
        }
    },
    
    // ===== CURRICULUM MANAGEMENT (ADMIN) =====
    addCurriculumWeek: async (programId, weekNumber, weekTitle, topics = []) => {
        try {
            const response = await programAPI.addCurriculumWeek(programId, {
                week_number: weekNumber,
                week_title: weekTitle,
                topics
            });
            return response;
        } catch (error) {
            console.error('Failed to add curriculum week:', error);
            throw error;
        }
    },
    
    updateCurriculumWeek: async (id, weekData) => {
        try {
            const response = await programAPI.updateCurriculumWeek(id, weekData);
            return response;
        } catch (error) {
            console.error(`Failed to update curriculum week ${id}:`, error);
            throw error;
        }
    },
    
    removeCurriculumWeek: async (id) => {
        try {
            const response = await programAPI.removeCurriculumWeek(id);
            return response;
        } catch (error) {
            console.error(`Failed to remove curriculum week ${id}:`, error);
            throw error;
        }
    },
    
    // ===== FAQ MANAGEMENT (ADMIN) =====
    addFaq: async (programId, question, answer, displayOrder = 0) => {
        try {
            const response = await programAPI.addFaq(programId, {
                question,
                answer,
                display_order: displayOrder
            });
            return response;
        } catch (error) {
            console.error('Failed to add FAQ:', error);
            throw error;
        }
    },
    
    updateFaq: async (id, faqData) => {
        try {
            const response = await programAPI.updateFaq(id, faqData);
            return response;
        } catch (error) {
            console.error(`Failed to update FAQ ${id}:`, error);
            throw error;
        }
    },
    
    removeFaq: async (id) => {
        try {
            const response = await programAPI.removeFaq(id);
            return response;
        } catch (error) {
            console.error(`Failed to remove FAQ ${id}:`, error);
            throw error;
        }
    },
    
    // ===== START DATES MANAGEMENT (ADMIN) =====
    addStartDate: async (programId, startDate, spotsAvailable, totalSpots) => {
        try {
            const response = await programAPI.addStartDate(programId, {
                start_date: startDate,
                spots_available: spotsAvailable,
                total_spots: totalSpots
            });
            return response;
        } catch (error) {
            console.error('Failed to add start date:', error);
            throw error;
        }
    },
    
    updateStartDate: async (id, spotsAvailable) => {
        try {
            const response = await programAPI.updateStartDate(id, spotsAvailable);
            return response;
        } catch (error) {
            console.error(`Failed to update start date ${id}:`, error);
            throw error;
        }
    },
    
    removeStartDate: async (id) => {
        try {
            const response = await programAPI.removeStartDate(id);
            return response;
        } catch (error) {
            console.error(`Failed to remove start date ${id}:`, error);
            throw error;
        }
    },
    
    // ===== RELATED PROGRAMS MANAGEMENT (ADMIN) =====
    addRelatedProgram: async (programId, relatedProgramId, displayOrder = 0) => {
        try {
            const response = await programAPI.addRelatedProgram(programId, relatedProgramId, displayOrder);
            return response;
        } catch (error) {
            console.error('Failed to add related program:', error);
            throw error;
        }
    },
    
    removeRelatedProgram: async (programId, relatedProgramId) => {
        try {
            const response = await programAPI.removeRelatedProgram(programId, relatedProgramId);
            return response;
        } catch (error) {
            console.error('Failed to remove related program:', error);
            throw error;
        }
    },
    
    // ===== UPGRADE OPTIONS MANAGEMENT (ADMIN) =====
    addUpgradeOption: async (programId, upgradeProgramId, badgeText = '', displayOrder = 0) => {
        try {
            const response = await programAPI.addUpgradeOption(programId, upgradeProgramId, badgeText, displayOrder);
            return response;
        } catch (error) {
            console.error('Failed to add upgrade option:', error);
            throw error;
        }
    },
    
    removeUpgradeOption: async (programId, upgradeProgramId) => {
        try {
            const response = await programAPI.removeUpgradeOption(programId, upgradeProgramId);
            return response;
        } catch (error) {
            console.error('Failed to remove upgrade option:', error);
            throw error;
        }
    },
    
    // ===== SCHEDULE MANAGEMENT (ADMIN) =====
    createSchedule: async (scheduleData) => {
        try {
            const response = await programAPI.createSchedule(scheduleData);
            return response;
        } catch (error) {
            console.error('Failed to create schedule:', error);
            throw error;
        }
    },
    
    updateSchedule: async (id, scheduleData) => {
        try {
            const response = await programAPI.updateSchedule(id, scheduleData);
            return response;
        } catch (error) {
            console.error(`Failed to update schedule ${id}:`, error);
            throw error;
        }
    },
    
    deleteSchedule: async (id) => {
        try {
            const response = await programAPI.deleteSchedule(id);
            return response;
        } catch (error) {
            console.error(`Failed to delete schedule ${id}:`, error);
            throw error;
        }
    },
    
    // ===== FORMATTING UTILITIES =====
    
    /**
     * Format program data for display
     * @param {Object} program - Raw program data from API
     * @returns {Object} - Formatted program data with all new fields
     */
    formatProgramForDisplay: (program) => {
        if (!program) return null;
        
        // Parse capacity string (e.g., "8/12 enrolled")
        let enrolledCount = 0;
        let totalCapacity = 0;
        
        if (program.capacity && typeof program.capacity === 'string') {
            const match = program.capacity.match(/(\d+)\/(\d+)/);
            if (match) {
                enrolledCount = parseInt(match[1]) || 0;
                totalCapacity = parseInt(match[2]) || 0;
            }
        }
        
        return {
            id: program.id,
            title: program.title,
            image: program.image,
            description: program.description,
            category: program.category,
            price: program.price,
            capacity: program.capacity,
            enrolledCount,
            totalCapacity,
            spotsLeft: totalCapacity - enrolledCount,
            featured: program.featured || false,
            duration: program.duration,
            level: program.level,
            isSaved: program.isSaved || false,
            
            // NEW: Gallery images
            gallery: program.gallery || [],
            
            // NEW: Curriculum weeks
            curriculum: program.curriculum || [],
            
            // NEW: FAQs
            faqs: program.faqs || [],
            
            // NEW: Start dates
            start_dates: program.start_dates || [],
            
            // NEW: Related programs
            related_programs: program.related_programs || [],
            
            // NEW: Upgrade options
            upgrade_options: program.upgrade_options || [],
            
            // NEW: Schedules
            schedules: program.schedules || [],
            
            // NEW: Instructor info
            instructor_id: program.instructor_id,
            instructor_name: program.instructor_name,
            instructor_bio: program.instructor_bio,
            instructor_image: program.instructor_image,
            
            // NEW: Video
            video_url: program.video_url,
            
            // NEW: Stats
            total_spots: program.total_spots,
            enrolled_count: program.enrolled_count
        };
    },
    
    formatScheduleForDisplay: (schedule) => {
        if (!schedule) return null;
        
        return {
            id: schedule.id,
            time: `${schedule.start_time?.substring(0,5)} - ${schedule.end_time?.substring(0,5)}`,
            name: schedule.class_name,
            instructor: schedule.instructor,
            location: schedule.location,
            capacity: schedule.capacity,
            enrolled: schedule.enrolled,
            available: (schedule.capacity - schedule.enrolled)
        };
    },
    
    getDaySchedule: (schedules, day) => {
        if (!schedules || !schedules[day]) return [];
        return schedules[day].map(s => programService.formatScheduleForDisplay(s));
    },
    
    /**
     * Format start date for display
     * @param {Object} date - Raw start date data
     * @returns {Object} - Formatted start date
     */
    formatStartDateForDisplay: (date) => {
        if (!date) return null;
        
        return {
            id: date.id,
            date: date.start_date,
            formatted_date: new Date(date.start_date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }),
            spots_available: date.spots_available,
            total_spots: date.total_spots,
            spots_left: date.spots_available,
            is_available: date.spots_available > 0,
            is_low: date.spots_available <= 5 && date.spots_available > 0,
            is_full: date.spots_available === 0
        };
    },
    
    /**
     * Format FAQ for display
     * @param {Object} faq - Raw FAQ data
     * @returns {Object} - Formatted FAQ
     */
    formatFaqForDisplay: (faq) => {
        if (!faq) return null;
        
        return {
            id: faq.id,
            question: faq.question,
            answer: faq.answer,
            display_order: faq.display_order
        };
    },
    
    /**
     * Format curriculum week for display
     * @param {Object} week - Raw curriculum data
     * @returns {Object} - Formatted curriculum week
     */
    formatCurriculumWeekForDisplay: (week) => {
        if (!week) return null;
        
        return {
            id: week.id,
            week_number: week.week_number,
            week_title: week.week_title,
            topics: week.topics || []
        };
    },
    
    /**
     * Format upgrade option for display
     * @param {Object} upgrade - Raw upgrade option data
     * @returns {Object} - Formatted upgrade option
     */
    formatUpgradeOptionForDisplay: (upgrade) => {
        if (!upgrade) return null;
        
        return {
            id: upgrade.id,
            title: upgrade.title,
            price: upgrade.price,
            duration: upgrade.duration,
            badge_text: upgrade.badge_text
        };
    },
    
    /**
     * Get urgency badge color based on spots left
     * @param {number} spotsLeft 
     * @returns {Object} - Tailwind color classes
     */
    getUrgencyColor: (spotsLeft) => {
        if (spotsLeft === 0) {
            return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', badge: 'bg-red-500' };
        }
        if (spotsLeft <= 2) {
            return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', badge: 'bg-orange-500' };
        }
        if (spotsLeft <= 5) {
            return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', badge: 'bg-yellow-500' };
        }
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', badge: 'bg-green-500' };
    }
};

export default programService;
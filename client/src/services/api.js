// api.js - Frontend API Helper for Session-based Authentication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://gym-application-kq9p.onrender.com/api';

// Helper for making requests with credentials (for sessions)
const request = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
    credentials: 'include', // CRITICAL: This sends cookies/session
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle 204 No Content
    if (response.status === 204) return null;

    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        ...data,
      };
    }

    return data;
  } catch (error) {
    if (error.status) throw error;
    throw {
      success: false,
      message: error.message || 'Network error. Please check your connection.',
    };
  }
};

// Generic methods
const get = (endpoint) => request(endpoint, { method: 'GET' });
const post = (endpoint, body) => request(endpoint, { 
  method: 'POST', 
  body: JSON.stringify(body) 
});
const put = (endpoint, body) => request(endpoint, { 
  method: 'PUT', 
  body: JSON.stringify(body) 
});
const del = (endpoint) => request(endpoint, { method: 'DELETE' });

// ==================== AUTH ====================
export const authAPI = {
  register: (memberData) => post('/auth/register', memberData),
  login: (credentials) => post('/auth/login', credentials),
  logout: () => post('/auth/logout'),
  getCurrentUser: () => get('/auth/me'),
};

// ==================== MEMBERS ====================
export const memberAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return get(`/members${query ? `?${query}` : ''}`);
  },
  getById: (id) => get(`/members/${id}`),
  update: (id, memberData) => put(`/members/${id}`, memberData),
  delete: (id) => del(`/members/${id}`),
  getStats: () => get('/members/stats'),
};

// ==================== TRAINERS ====================
export const trainerAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return get(`/trainers${query ? `?${query}` : ''}`);
  },
  getById: (id) => get(`/trainers/${id}`),
  create: (trainerData) => post('/trainers', trainerData),
  update: (id, trainerData) => put(`/trainers/${id}`, trainerData),
  delete: (id) => del(`/trainers/${id}`),
  getFeatured: (limit = 6) => {
    return get(`/trainers/featured${limit ? `?limit=${limit}` : ''}`);
  },
  getBySpecialty: (specialty) => get(`/trainers/specialty/${specialty}`),
  getSpecialties: () => get('/trainers/specialties'),
  getStats: () => get('/trainers/stats'),
};

// ==================== SERVICES ====================
export const serviceAPI = {
  // Services
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return get(`/services${query ? `?${query}` : ''}`);
  },
  getById: (id) => get(`/services/${id}`),
  getFeatured: (limit = 4) => get(`/services/featured${limit ? `?limit=${limit}` : ''}`),
  getByCategory: (category) => get(`/services/category/${encodeURIComponent(category)}`),
  getCategories: () => get('/services/categories/list'),
  getStats: () => get('/services/stats'),
  
  // Service Categories (for the categories section)
  getAllServiceCategories: () => get('/services/categories/all'),
  getServiceCategoryById: (id) => get(`/services/categories/${id}`),
  
  // Admin only
  create: (serviceData) => post('/services', serviceData),
  update: (id, serviceData) => put(`/services/${id}`, serviceData),
  delete: (id) => del(`/services/${id}`),
  createCategory: (categoryData) => post('/services/categories', categoryData),
  updateCategory: (id, categoryData) => put(`/services/categories/${id}`, categoryData),
  deleteCategory: (id) => del(`/services/categories/${id}`),
  addServiceToCategory: (data) => post('/services/categories/items', data),
  updateCategoryItem: (id, data) => put(`/services/categories/items/${id}`, data),
  removeServiceFromCategory: (id) => del(`/services/categories/items/${id}`)
};

// ==================== PROGRAMS ====================
export const programAPI = {
    // ===== PUBLIC ROUTES =====
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return get(`/programs${query ? `?${query}` : ''}`);
    },
    getById: (id) => get(`/programs/${id}`),
    getFeatured: (limit = 4) => get(`/programs/featured?limit=${limit}`),
    getByCategory: (category, params = {}) => {
        const query = new URLSearchParams(params).toString();
        return get(`/programs/category/${category}${query ? `?${query}` : ''}`);
    },
    getCategories: () => get('/programs/categories'),
    getScheduleByDay: (day) => get(`/programs/schedules/${day}`),
    getAllSchedules: () => get('/programs/schedules'),
    getStats: () => get('/programs/stats'),
    
    // ===== MEMBER ROUTES (Auth Required) =====
    enroll: (programId) => post('/programs/enroll', { program_id: programId }),
    getMyEnrollments: () => get('/programs/my-enrollments'),
    
    // ===== SAVED PROGRAMS (WISHLIST) =====
    saveProgram: (programId) => post(`/programs/${programId}/save`),
    unsaveProgram: (programId) => del(`/programs/${programId}/save`),
    getMySavedPrograms: () => get('/programs/my/saved'),
    
    // ===== ADMIN ROUTES =====
    // Program management
    create: (programData) => post('/programs', programData),
    update: (id, programData) => put(`/programs/${id}`, programData),
    delete: (id) => del(`/programs/${id}`),
    
    // Schedule management
    createSchedule: (scheduleData) => post('/programs/schedules', scheduleData),
    updateSchedule: (id, scheduleData) => put(`/programs/schedules/${id}`, scheduleData),
    deleteSchedule: (id) => del(`/programs/schedules/${id}`),
    
    // ===== GALLERY MANAGEMENT =====
    addGalleryImage: (programId, imageData) => post(`/programs/${programId}/gallery`, imageData),
    removeGalleryImage: (imageId) => del(`/programs/gallery/${imageId}`),
    
    // ===== CURRICULUM MANAGEMENT =====
    addCurriculumWeek: (programId, weekData) => post(`/programs/${programId}/curriculum`, weekData),
    updateCurriculumWeek: (id, weekData) => put(`/programs/curriculum/${id}`, weekData),
    removeCurriculumWeek: (id) => del(`/programs/curriculum/${id}`),
    
    // ===== FAQ MANAGEMENT =====
    addFaq: (programId, faqData) => post(`/programs/${programId}/faqs`, faqData),
    updateFaq: (id, faqData) => put(`/programs/faqs/${id}`, faqData),
    removeFaq: (id) => del(`/programs/faqs/${id}`),
    
    // ===== START DATES MANAGEMENT =====
    addStartDate: (programId, dateData) => post(`/programs/${programId}/start-dates`, dateData),
    updateStartDate: (id, spotsAvailable) => put(`/programs/start-dates/${id}`, { spots_available: spotsAvailable }),
    removeStartDate: (id) => del(`/programs/start-dates/${id}`),
    
    // ===== RELATED PROGRAMS MANAGEMENT =====
    addRelatedProgram: (programId, relatedProgramId, displayOrder = 0) => 
        post(`/programs/${programId}/related`, { related_program_id: relatedProgramId, display_order: displayOrder }),
    removeRelatedProgram: (programId, relatedProgramId) => 
        del(`/programs/${programId}/related/${relatedProgramId}`),
    
    // ===== UPGRADE OPTIONS MANAGEMENT =====
    addUpgradeOption: (programId, upgradeProgramId, badgeText = '', displayOrder = 0) => 
        post(`/programs/${programId}/upgrades`, { 
            upgrade_program_id: upgradeProgramId, 
            badge_text: badgeText, 
            display_order: displayOrder 
        }),
    removeUpgradeOption: (programId, upgradeProgramId) => 
        del(`/programs/${programId}/upgrades/${upgradeProgramId}`)
};

// ==================== BOOKINGS ====================
export const bookingAPI = {
  // ===== MAIN BOOKING OPERATIONS =====
  
  /**
   * Get all bookings (admin only)
   * @param {Object} params - Query parameters (status, page, limit, member_id, trainer_id, from_date, to_date)
   */
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return get(`/bookings${query ? `?${query}` : ''}`);
  },
  
  /**
   * Get booking by ID
   * @param {string|number} id - Booking ID
   */
  getById: (id) => get(`/bookings/${id}`),
  
  /**
   * Get bookings by user ID
   * @param {string|number} userId - User ID
   * @param {Object} params - Query parameters (page, limit, status, upcoming, past, from_date, to_date)
   */
  getByUser: (userId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return get(`/bookings/user/${userId}${query ? `?${query}` : ''}`);
  },
  
  /**
   * Get bookings by trainer ID
   * @param {string|number} trainerId - Trainer ID
   * @param {Object} params - Query parameters (page, limit, status, date)
   */
  getByTrainer: (trainerId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return get(`/bookings/trainer/${trainerId}${query ? `?${query}` : ''}`);
  },
  
  /**
   * Create new booking
   * @param {Object} bookingData - Booking data (member_id, trainer_id, service_id, service_name, trainer_name, member_name, member_email, booking_date, booking_time, session_type, duration_minutes, notes, special_requests)
   */
  create: (bookingData) => post('/bookings', bookingData),
  
  /**
   * Update booking
   * @param {string|number} id - Booking ID
   * @param {Object} bookingData - Updated booking data
   */
  update: (id, bookingData) => put(`/bookings/${id}`, bookingData),
  
  /**
   * Cancel booking with reason
   * @param {string|number} id - Booking ID
   * @param {string} reason - Cancellation reason
   */
  cancel: (id, reason) => put(`/bookings/${id}/cancel`, { reason }),
  
  /**
   * Reschedule booking
   * @param {string|number} id - Booking ID
   * @param {Object} rescheduleData - { new_date, new_time }
   */
  reschedule: (id, rescheduleData) => put(`/bookings/${id}/reschedule`, rescheduleData),
  
  /**
   * Complete booking (trainer/admin)
   * @param {string|number} id - Booking ID
   */
  complete: (id) => put(`/bookings/${id}/complete`),
  
  /**
   * Confirm booking (admin/trainer)
   * @param {string|number} id - Booking ID
   */
  confirm: (id) => put(`/bookings/${id}/confirm`),
  
  /**
   * Mark booking as no-show (admin/trainer)
   * @param {string|number} id - Booking ID
   */
  noShow: (id) => put(`/bookings/${id}/no-show`),
  
  /**
   * Update booking status (admin)
   * @param {string|number} id - Booking ID
   * @param {Object} data - { status, reason }
   */
  updateStatus: (id, data) => put(`/bookings/${id}/status`, data),
  
  /**
   * Delete booking (admin - soft delete)
   * @param {string|number} id - Booking ID
   */
  delete: (id) => del(`/bookings/${id}`),
  
  // ===== AVAILABILITY =====
  
  /**
   * Check trainer availability
   * @param {string|number} trainerId - Trainer ID
   * @param {string} date - Date to check (YYYY-MM-DD)
   */
  checkAvailability: (trainerId, date) => {
    const params = new URLSearchParams({ trainerId, date }).toString();
    return get(`/bookings/availability?${params}`);
  },
  
  /**
   * Create availability slots for a trainer
   * @param {Object} availabilityData - { trainer_id, date, times }
   */
  createAvailabilitySlots: (availabilityData) => post('/bookings/availability', availabilityData),
  
  // ===== BOOKING HISTORY =====
  
  /**
   * Get booking history/audit trail
   * @param {string|number} bookingId - Booking ID
   */
  getHistory: (bookingId) => get(`/bookings/${bookingId}/history`),
  
  // ===== BOOKING STATISTICS =====
  
  /**
   * Get booking statistics (admin)
   */
  getStats: () => get('/bookings/stats'),
};

// ==================== FEEDBACK ====================
export const feedbackAPI = {
  /**
   * Submit feedback for a completed booking
   * @param {Object} feedbackData - { booking_id, member_id, trainer_id, rating, review, would_recommend }
   */
  submit: (feedbackData) => post('/booking-feedback', feedbackData),
  
  /**
   * Get feedback by trainer ID
   * @param {string|number} trainerId - Trainer ID
   * @param {Object} params - Query parameters (page, limit)
   */
  getByTrainer: (trainerId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return get(`/booking-feedback/trainer/${trainerId}${query ? `?${query}` : ''}`);
  },
  
  /**
   * Get feedback by booking ID
   * @param {string|number} bookingId - Booking ID
   */
  getByBooking: (bookingId) => get(`/booking-feedback/booking/${bookingId}`),
  
  /**
   * Get trainer ratings
   * @param {string|number} trainerId - Trainer ID
   */
  getTrainerRating: (trainerId) => get(`/booking-feedback/trainer/${trainerId}/rating`),
};

// ==================== MEMBERSHIPS ====================
export const membershipAPI = {
  // ===== PUBLIC ROUTES =====
  
  /**
   * Get all active membership plans
   * @returns {Promise} - Array of membership plans
   */
  getAllPlans: () => get('/memberships/plans'),
  
  /**
   * Get single plan by ID
   * @param {string|number} id - Plan ID
   * @returns {Promise} - Plan details
   */
  getPlanById: (id) => get(`/memberships/plans/${id}`),
  
  // ===== MEMBER ROUTES (Auth Required) =====
  
  /**
   * Purchase a membership
   * @param {Object} purchaseData - { plan_id, billing_cycle, auto_renew }
   */
  purchase: (purchaseData) => post('/memberships/purchase', purchaseData),
  
  /**
   * Get current user's active membership
   */
  getMyMembership: () => get('/memberships/my-membership'),
  
  /**
   * Get user's membership history
   * @param {Object} params - { page, limit }
   */
  getMyHistory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return get(`/memberships/my-history${query ? `?${query}` : ''}`);
  },
  
  /**
   * Cancel membership
   * @param {string|number} id - Membership ID
   * @param {string} reason - Cancellation reason
   */
  cancel: (id, reason = '') => put(`/memberships/${id}/cancel`, { reason }),
  
  /**
   * Toggle auto-renew
   * @param {string|number} id - Membership ID
   */
  toggleAutoRenew: (id) => put(`/memberships/${id}/toggle-renew`),
  
  /**
   * Change/upgrade/downgrade plan
   * @param {string|number} id - Membership ID
   * @param {Object} changeData - { new_plan_id, new_billing_cycle }
   */
  changePlan: (id, changeData) => put(`/memberships/${id}/change-plan`, changeData),
  
  // ===== ADMIN ROUTES =====
  
  /**
   * Create new membership plan (admin)
   * @param {Object} planData - { name, description, price_monthly, price_yearly, features, highlighted, display_order }
   */
  createPlan: (planData) => post('/memberships/plans', planData),
  
  /**
   * Update membership plan (admin)
   * @param {string|number} id - Plan ID
   * @param {Object} planData - Updated plan data
   */
  updatePlan: (id, planData) => put(`/memberships/plans/${id}`, planData),
  
  /**
   * Delete membership plan (admin - soft delete)
   * @param {string|number} id - Plan ID
   */
  deletePlan: (id) => del(`/memberships/plans/${id}`),
  
  /**
   * Get all active memberships (admin)
   * @param {Object} params - { page, limit }
   */
  getAllMemberships: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return get(`/memberships/admin/memberships${query ? `?${query}` : ''}`);
  },
  
  /**
   * Get membership statistics (admin)
   */
  getStats: () => get('/memberships/admin/stats'),
  
  /**
   * Process membership renewals (admin - cron job)
   */
  processRenewals: () => post('/memberships/admin/process-renewals'),
};

// ==================== HEALTH CHECK ====================
export const healthCheck = () => get('/health');

// ==================== SESSION TEST ====================
export const sessionTest = () => get('/session-test');

// ==================== DEFAULT EXPORT ====================
export default {
  // Generic methods
  get,
  post,
  put,
  delete: del,
  
  // API modules
  authAPI,
  memberAPI,
  trainerAPI,
  serviceAPI,
  programAPI,
  bookingAPI,
  feedbackAPI,
  membershipAPI,
  
  // Utility
  healthCheck,
  sessionTest,
};
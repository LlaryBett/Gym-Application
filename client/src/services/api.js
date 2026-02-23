// api.js - Frontend API Helper for JWT Token Authentication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://gym-application-kq9p.onrender.com/api';

// Helper to get token from localStorage
const getToken = () => localStorage.getItem('token');

// Helper for making requests with JWT token
const request = async (endpoint, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
    // No credentials needed - using token instead
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle 204 No Content
    if (response.status === 204) return null;

    const data = await response.json();

    if (!response.ok) {
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        // Clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
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
  
  login: async (credentials) => {
    const response = await post('/auth/login', credentials);
    if (response.success && response.data?.token) {
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
    }
    return response;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve({ success: true });
  },
  
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
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return get(`/services${query ? `?${query}` : ''}`);
  },
  getById: (id) => get(`/services/${id}`),
  getFeatured: (limit = 4) => get(`/services/featured${limit ? `?limit=${limit}` : ''}`),
  getByCategory: (category) => get(`/services/category/${encodeURIComponent(category)}`),
  getCategories: () => get('/services/categories/list'),
  getStats: () => get('/services/stats'),
  
  // Service Categories
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
    create: (programData) => post('/programs', programData),
    update: (id, programData) => put(`/programs/${id}`, programData),
    delete: (id) => del(`/programs/${id}`),
    createSchedule: (scheduleData) => post('/programs/schedules', scheduleData),
    updateSchedule: (id, scheduleData) => put(`/programs/schedules/${id}`, scheduleData),
    deleteSchedule: (id) => del(`/programs/schedules/${id}`),
    addGalleryImage: (programId, imageData) => post(`/programs/${programId}/gallery`, imageData),
    removeGalleryImage: (imageId) => del(`/programs/gallery/${imageId}`),
    addCurriculumWeek: (programId, weekData) => post(`/programs/${programId}/curriculum`, weekData),
    updateCurriculumWeek: (id, weekData) => put(`/programs/curriculum/${id}`, weekData),
    removeCurriculumWeek: (id) => del(`/programs/curriculum/${id}`),
    addFaq: (programId, faqData) => post(`/programs/${programId}/faqs`, faqData),
    updateFaq: (id, faqData) => put(`/programs/faqs/${id}`, faqData),
    removeFaq: (id) => del(`/programs/faqs/${id}`),
    addStartDate: (programId, dateData) => post(`/programs/${programId}/start-dates`, dateData),
    updateStartDate: (id, spotsAvailable) => put(`/programs/start-dates/${id}`, { spots_available: spotsAvailable }),
    removeStartDate: (id) => del(`/programs/start-dates/${id}`),
    addRelatedProgram: (programId, relatedProgramId, displayOrder = 0) => 
        post(`/programs/${programId}/related`, { related_program_id: relatedProgramId, display_order: displayOrder }),
    removeRelatedProgram: (programId, relatedProgramId) => 
        del(`/programs/${programId}/related/${relatedProgramId}`),
    addUpgradeOption: (programId, upgradeProgramId, badgeText = '', displayOrder = 0) => 
        post(`/programs/${programId}/upgrades`, { 
            upgrade_program_id: upgradeProgramId, 
            badge_text: badgeText, 
            display_order: displayOrder 
        }),
    removeUpgradeOption: (programId, upgradeProgramId) => 
        del(`/programs/${programId}/upgrades/${upgradeProgramId}`)
};

// ==================== CHAT ====================
export const chatAPI = {
  sendMessage: (message, sessionId = null, userName = 'User') => {
    const payload = { message, userName };
    if (sessionId) {
      payload.sessionId = sessionId;
    }
    return post('/chat/message', payload);
  },
  getHistory: (sessionId) => get(`/chat/history/${sessionId}`),
  clearSession: (sessionId) => del(`/chat/session/${sessionId}`),
  trackSession: (sessionId, userData) => post('/chat/track', { sessionId, userData })
};

// ==================== BOOKINGS ====================
export const bookingAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return get(`/bookings${query ? `?${query}` : ''}`);
  },
  getById: (id) => get(`/bookings/${id}`),
  getByUser: (userId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return get(`/bookings/user/${userId}${query ? `?${query}` : ''}`);
  },
  getByTrainer: (trainerId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return get(`/bookings/trainer/${trainerId}${query ? `?${query}` : ''}`);
  },
  create: (bookingData) => post('/bookings', bookingData),
  update: (id, bookingData) => put(`/bookings/${id}`, bookingData),
  cancel: (id, reason) => put(`/bookings/${id}/cancel`, { reason }),
  reschedule: (id, rescheduleData) => put(`/bookings/${id}/reschedule`, rescheduleData),
  complete: (id) => put(`/bookings/${id}/complete`),
  confirm: (id) => put(`/bookings/${id}/confirm`),
  noShow: (id) => put(`/bookings/${id}/no-show`),
  updateStatus: (id, data) => put(`/bookings/${id}/status`, data),
  delete: (id) => del(`/bookings/${id}`),
  checkAvailability: (trainerId, date) => {
    const params = new URLSearchParams({ trainerId, date }).toString();
    return get(`/bookings/availability?${params}`);
  },
  createAvailabilitySlots: (availabilityData) => post('/bookings/availability', availabilityData),
  getHistory: (bookingId) => get(`/bookings/${bookingId}/history`),
  getStats: () => get('/bookings/stats'),
};

// ==================== FEEDBACK ====================
export const feedbackAPI = {
  submit: (feedbackData) => post('/booking-feedback', feedbackData),
  getByTrainer: (trainerId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return get(`/booking-feedback/trainer/${trainerId}${query ? `?${query}` : ''}`);
  },
  getByBooking: (bookingId) => get(`/booking-feedback/booking/${bookingId}`),
  getTrainerRating: (trainerId) => get(`/booking-feedback/trainer/${trainerId}/rating`),
};

// ==================== MEMBERSHIPS ====================
export const membershipAPI = {
  getAllPlans: () => get('/memberships/plans'),
  getPlanById: (id) => get(`/memberships/plans/${id}`),
  purchase: (purchaseData) => post('/memberships/purchase', purchaseData),
  getMyMembership: () => get('/memberships/my-membership'),
  getMyHistory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return get(`/memberships/my-history${query ? `?${query}` : ''}`);
  },
  cancel: (id, reason = '') => put(`/memberships/${id}/cancel`, { reason }),
  toggleAutoRenew: (id) => put(`/memberships/${id}/toggle-renew`),
  changePlan: (id, changeData) => put(`/memberships/${id}/change-plan`, changeData),
  createPlan: (planData) => post('/memberships/plans', planData),
  updatePlan: (id, planData) => put(`/memberships/plans/${id}`, planData),
  deletePlan: (id) => del(`/memberships/plans/${id}`),
  getAllMemberships: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return get(`/memberships/admin/memberships${query ? `?${query}` : ''}`);
  },
  getStats: () => get('/memberships/admin/stats'),
  processRenewals: () => post('/memberships/admin/process-renewals'),
};

// ==================== HEALTH CHECK ====================
export const healthCheck = () => get('/health');

// ==================== DEFAULT EXPORT ====================
export default {
  get,
  post,
  put,
  delete: del,
  authAPI,
  memberAPI,
  trainerAPI,
  serviceAPI,
  programAPI,
  bookingAPI,
  feedbackAPI,
  membershipAPI,
  chatAPI,
  healthCheck,
};
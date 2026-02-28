import api from './api';

export const adminAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getRecentMembers: (limit = 5) => api.get(`/admin/members/recent?limit=${limit}`),
  getPopularPrograms: (dateRange = null) => {
    if (dateRange) {
      return api.post('/admin/programs/popular', dateRange);
    }
    return api.get('/admin/programs/popular');
  },
  getRevenueData: (days = 30) => api.get(`/admin/reports/revenue?days=${days}`),
  getMemberGrowth: (days = 30) => api.get(`/admin/reports/member-growth?days=${days}`),

  // Reports - detailed methods
  getOverviewStats: (dateRange = {}) => api.post('/admin/reports/overview-stats', dateRange),
  getRevenueReport: (dateRange = {}) => api.post('/admin/reports/revenue', dateRange),
  getMemberGrowthReport: (dateRange = {}) => api.post('/admin/reports/member-growth', dateRange),
  getTrainerPerformance: (dateRange = {}) => api.post('/admin/reports/trainer-performance', dateRange),
  getMembershipDistribution: () => api.get('/admin/reports/membership-distribution'),
  getBookingTrends: (dateRange = {}) => api.post('/admin/reports/booking-trends', dateRange),
  getPeakHours: () => api.get('/admin/reports/peak-hours'),
  getRetentionRate: () => api.get('/admin/reports/retention-rate'),

  // Members
  getAllMembers: (params) => {
    const query = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
      ...(params.membershipType && { membership_type: params.membershipType }),
      ...(params.dateFrom && { from_date: params.dateFrom }),
      ...(params.dateTo && { to_date: params.dateTo })
    }).toString();
    return api.get(`/admin/members${query ? `?${query}` : ''}`);
  },
  getMemberById: (id) => api.get(`/admin/members/${id}`),
  updateMember: (id, data) => api.put(`/admin/members/${id}`, data),
  updateMemberStatus: (id, status) => api.put(`/admin/members/${id}/status`, { status }),
  addMemberNote: (id, note) => api.post(`/admin/members/${id}/notes`, { note }),
  deleteMember: (id) => api.delete(`/admin/members/${id}`),

  // ==================== TRAINERS ====================
  getAllTrainers: (params = {}) => {
    const query = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
      ...(params.specialty && { specialty: params.specialty }),
      ...(params.rating && { rating: params.rating }),
      ...(params.featured && { featured: params.featured })
    }).toString();
    
    return api.get(`/admin/trainers${query ? `?${query}` : ''}`);
  },
  
  getTrainerById: (id) => api.get(`/admin/trainers/${id}`),
  
  getTrainerSpecialties: () => api.get('/admin/trainers/specialties'),
  
  getTrainerStats: () => api.get('/admin/trainers/stats'),
  
  getFeaturedTrainers: (limit = 6) => api.get(`/admin/trainers/featured?limit=${limit}`),
  
  createTrainer: (data) => api.post('/admin/trainers', data),
  
  updateTrainer: (id, data) => api.put(`/admin/trainers/${id}`, data),
  
  deleteTrainer: (id) => api.delete(`/admin/trainers/${id}`),

  // ==================== PROGRAMS ====================
  // FIXED: Use the existing program routes (they already have adminMiddleware for write operations)
  getAllPrograms: (params = {}) => {
    const query = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.search && { search: params.search }),
      ...(params.category && { category: params.category }),
      ...(params.level && { level: params.level }),
      ...(params.featured && { featured: params.featured })
    }).toString();
    
    return api.get(`/programs${query ? `?${query}` : ''}`);
  },
  
  getProgramById: (id) => api.get(`/programs/${id}`),
  
  getProgramCategories: () => api.get('/programs/categories'),
  
  getProgramStats: () => api.get('/programs/stats'),
  
  getFeaturedPrograms: (limit = 4) => api.get(`/programs/featured?limit=${limit}`),
  
  // Admin operations (protected by adminMiddleware in backend)
  createProgram: (data) => api.post('/programs', data),
  
  updateProgram: (id, data) => api.put(`/programs/${id}`, data),
  
  deleteProgram: (id) => api.delete(`/programs/${id}`),
  
  // Gallery management
  addGalleryImage: (programId, data) => api.post(`/programs/${programId}/gallery`, data),
  removeGalleryImage: (imageId) => api.delete(`/programs/gallery/${imageId}`),
  
  // Curriculum management
  addCurriculumWeek: (programId, data) => api.post(`/programs/${programId}/curriculum`, data),
  updateCurriculumWeek: (id, data) => api.put(`/programs/curriculum/${id}`, data),
  removeCurriculumWeek: (id) => api.delete(`/programs/curriculum/${id}`),
  
  // FAQ management
  addFaq: (programId, data) => api.post(`/programs/${programId}/faqs`, data),
  updateFaq: (id, data) => api.put(`/programs/faqs/${id}`, data),
  removeFaq: (id) => api.delete(`/programs/faqs/${id}`),
  
  // Schedule management
  createSchedule: (data) => api.post('/programs/schedules', data),
  updateSchedule: (id, data) => api.put(`/programs/schedules/${id}`, data),
  deleteSchedule: (id) => api.delete(`/programs/schedules/${id}`),

  // ==================== BOOKINGS ====================
  getAllBookings: (params = {}) => {
    const query = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
      ...(params.dateFrom && { from_date: params.dateFrom }),
      ...(params.dateTo && { to_date: params.dateTo }),
      ...(params.trainerId && { trainer_id: params.trainerId }),
      ...(params.memberId && { member_id: params.memberId })
    }).toString();
    
    return api.get(`/bookings${query ? `?${query}` : ''}`);
  },
  
  updateBookingStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
  
  deleteBooking: (id) => api.delete(`/bookings/${id}`),
  
  rescheduleBooking: (id, data) => api.put(`/bookings/${id}/reschedule`, data),
  
  cancelBooking: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
  
  confirmBooking: (id) => api.put(`/bookings/${id}/confirm`),
  
  getBookingStats: () => api.get('/bookings/stats'),
  
  getBookingById: (id) => api.get(`/bookings/${id}`),
  
  getBookingHistory: (id) => api.get(`/bookings/${id}/history`),

  // ==================== MEMBERSHIP PLANS ====================
  getAllPlans: (params = {}) => {
    const query = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.search && { search: params.search }),
      ...(params.status && { status: params.status }),
      ...(params.minPrice && { minPrice: params.minPrice }),
      ...(params.maxPrice && { maxPrice: params.maxPrice }),
      ...(params.featured && { featured: params.featured })
    }).toString();
    
    return api.get(`/memberships/admin/plans${query ? `?${query}` : ''}`);
  },
  
  getPlanById: (id) => api.get(`/memberships/plans/${id}`),
  
  createPlan: (data) => api.post('/memberships/plans', data),
  
  updatePlan: (id, data) => api.put(`/memberships/plans/${id}`, data),
  
  deletePlan: (id) => api.delete(`/memberships/plans/${id}`),

  // Additional membership admin methods
  getAllMemberships: (params) => {
    const query = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.status && { status: params.status }),
      ...(params.planId && { plan_id: params.planId })
    }).toString();
    return api.get(`/memberships/admin/memberships${query ? `?${query}` : ''}`);
  },
  
  getMembershipStats: () => api.get('/memberships/admin/stats'),
  
  processRenewals: () => api.post('/memberships/admin/process-renewals'),

  // Reports Export
  exportReport: (type, format = 'csv') => api.get(`/admin/reports/export/${type}?format=${format}`),
  
  exportMembers: (format = 'csv', filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return api.post(`/admin/members/export?format=${format}${query ? `&${query}` : ''}`);
  },
  
  exportBookings: (format = 'csv', filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return api.post(`/admin/bookings/export?format=${format}${query ? `&${query}` : ''}`);
  },
  
  exportTrainers: (format = 'csv', filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return api.post(`/admin/trainers/export?format=${format}${query ? `&${query}` : ''}`);
  },
  
  exportPrograms: (format = 'csv', filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    return api.post(`/admin/programs/export?format=${format}${query ? `&${query}` : ''}`);
  }
};
// client/src/services/membersService.js
import api from './api';

const membersService = {
  /**
   * USER REGISTRATION - Public endpoint for self-registration
   * @param {Object} memberData - Member registration data
   * @returns {Promise} Created member data
   */
  registerMember: async (memberData) => {
    return api.post('/members/register', memberData);
  },

  /**
   * Get all members (with optional pagination) - Admin only
   * @param {Object} params - Query parameters (page, limit, search, etc.)
   * @returns {Promise} List of members
   */
  getAllMembers: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = queryParams ? `/members?${queryParams}` : '/members';
    return api.get(endpoint);
  },

  /**
   * Get a single member by ID - Admin only
   * @param {string|number} id - Member ID
   * @returns {Promise} Member data
   */
  getMemberById: async (id) => {
    return api.get(`/members/${id}`);
  },

  /**
   * Update an existing member - Admin only
   * @param {string|number} id - Member ID
   * @param {Object} memberData - Updated member data
   * @returns {Promise} Updated member data
   */
  updateMember: async (id, memberData) => {
    return api.put(`/members/${id}`, memberData);
  },

  /**
   * Partially update a member (PATCH) - Admin only
   * @param {string|number} id - Member ID
   * @param {Object} updates - Partial updates
   * @returns {Promise} Updated member data
   */
  patchMember: async (id, updates) => {
    return api.patch(`/members/${id}`, updates);
  },

  /**
   * Delete a member - Admin only
   * @param {string|number} id - Member ID
   * @returns {Promise} Deletion confirmation
   */
  deleteMember: async (id) => {
    return api.delete(`/members/${id}`);
  },

  /**
   * Search members by criteria - Admin only
   * @param {Object} criteria - Search criteria (name, email, membership_type, etc.)
   * @returns {Promise} Search results
   */
  searchMembers: async (criteria) => {
    const queryParams = new URLSearchParams(criteria).toString();
    return api.get(`/members/search?${queryParams}`);
  },

  /**
   * Get members statistics - Admin only
   * @returns {Promise} Statistics data
   */
  getMemberStats: async () => {
    return api.get('/members/stats');
  },

  /**
   * Get members by membership type - Admin only
   * @param {string} membershipType - Type of membership
   * @returns {Promise} Filtered members
   */
  getMembersByType: async (membershipType) => {
    return api.get(`/members/type/${membershipType}`);
  },

  /**
   * Check membership status - Admin or member (if authenticated)
   * @param {string|number} id - Member ID
   * @returns {Promise} Membership status
   */
  checkMembershipStatus: async (id) => {
    return api.get(`/members/${id}/status`);
  },

  /**
   * Renew membership - Admin or member
   * @param {string|number} id - Member ID
   * @param {Object} renewalData - Renewal data (new_end_date, payment_info, etc.)
   * @returns {Promise} Renewal confirmation
   */
  renewMembership: async (id, renewalData) => {
    return api.post(`/members/${id}/renew`, renewalData);
  },

  /**
   * Freeze membership (temporarily suspend) - Admin or member
   * @param {string|number} id - Member ID
   * @param {Object} freezeData - Freeze details (start_date, end_date, reason)
   * @returns {Promise} Freeze confirmation
   */
  freezeMembership: async (id, freezeData) => {
    return api.post(`/members/${id}/freeze`, freezeData);
  },

  /**
   * Unfreeze membership - Admin or member
   * @param {string|number} id - Member ID
   * @returns {Promise} Unfreeze confirmation
   */
  unfreezeMembership: async (id) => {
    return api.post(`/members/${id}/unfreeze`);
  },

  /**
   * Upload member photo/document - Member or admin
   * @param {string|number} id - Member ID
   * @param {FormData} formData - File upload form data
   * @returns {Promise} Upload confirmation with file URL
   */
  uploadMemberFile: async (id, formData) => {
    return api.uploadFile(`/members/${id}/upload`, formData);
  },

  /**
   * Get member attendance records - Admin or member
   * @param {string|number} id - Member ID
   * @param {Object} params - Date range, pagination
   * @returns {Promise} Attendance records
   */
  getMemberAttendance: async (id, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const endpoint = queryParams 
      ? `/members/${id}/attendance?${queryParams}`
      : `/members/${id}/attendance`;
    return api.get(endpoint);
  },

  /**
   * Record member check-in - Member or admin
   * @param {string|number} id - Member ID
   * @returns {Promise} Check-in confirmation
   */
  recordCheckIn: async (id) => {
    return api.post(`/members/${id}/checkin`);
  },

  /**
   * Record member check-out - Member or admin
   * @param {string|number} id - Member ID
   * @returns {Promise} Check-out confirmation
   */
  recordCheckOut: async (id) => {
    return api.post(`/members/${id}/checkout`);
  },

  /**
   * Get member payment history - Member or admin
   * @param {string|number} id - Member ID
   * @returns {Promise} Payment history
   */
  getPaymentHistory: async (id) => {
    return api.get(`/members/${id}/payments`);
  },

  /**
   * Send member notification (email/SMS) - Admin only
   * @param {string|number} id - Member ID
   * @param {Object} notificationData - Notification content
   * @returns {Promise} Notification confirmation
   */
  sendNotification: async (id, notificationData) => {
    return api.post(`/members/${id}/notify`, notificationData);
  },

  /**
   * Get members with expiring memberships - Admin only
   * @param {number} days - Number of days before expiry
   * @returns {Promise} List of members with expiring memberships
   */
  getExpiringMemberships: async (days = 7) => {
    return api.get(`/members/expiring?days=${days}`);
  },

  /**
   * Export members data - Admin only
   * @param {string} format - Export format (csv, excel, pdf)
   * @param {Object} filters - Export filters
   * @returns {Promise} Export file or data
   */
  exportMembers: async (format = 'csv', filters = {}) => {
    const queryParams = new URLSearchParams({ format, ...filters }).toString();
    return api.get(`/members/export?${queryParams}`, {
      Accept: format === 'csv' ? 'text/csv' : 
              format === 'pdf' ? 'application/pdf' : 
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  },

  /**
   * Get current member profile (for logged-in member)
   * @returns {Promise} Member profile data
   */
  getMyProfile: async () => {
    return api.get('/members/me');
  },

  /**
   * Update current member profile (for logged-in member)
   * @param {Object} profileData - Updated profile data
   * @returns {Promise} Updated profile
   */
  updateMyProfile: async (profileData) => {
    return api.put('/members/me', profileData);
  }
};

export default membersService;
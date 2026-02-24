// membershipService.js - Frontend Membership API Service
import api from './api.js';

// ==================== MEMBERSHIP API ====================
export const membershipAPI = {
  // ===== PUBLIC ROUTES (No Auth Required) =====
  
  /**
   * Get all active membership plans
   * @returns {Promise} - Array of membership plans
   */
  getAllPlans: () => api.get('/memberships/plans'),
  
  /**
   * Get single plan by ID
   * @param {string|number} id - Plan ID
   * @returns {Promise} - Plan details
   */
  getPlanById: (id) => api.get(`/memberships/plans/${id}`),
  
  // ===== MEMBER ROUTES (Auth Required) =====
  
  /**
   * Purchase a membership
   * @param {Object} purchaseData - { plan_id, billing_cycle, auto_renew }
   */
  purchase: (purchaseData) => api.post('/memberships/purchase', purchaseData),
  
  /**
   * Get current user's active membership
   */
  getMyMembership: () => api.get('/memberships/my-membership'),
  
  /**
   * Get user's membership history
   * @param {Object} params - { page, limit }
   */
  getMyHistory: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/memberships/my-history${query ? `?${query}` : ''}`);
  },
  
  /**
   * Cancel membership
   * @param {string|number} id - Membership ID
   * @param {string} reason - Cancellation reason
   */
  cancel: (id, reason = '') => api.put(`/memberships/${id}/cancel`, { reason }),
  
  /**
   * Toggle auto-renew
   * @param {string|number} id - Membership ID
   */
  toggleAutoRenew: (id) => api.put(`/memberships/${id}/toggle-renew`),
  
  /**
   * Change/upgrade/downgrade plan
   * @param {string|number} id - Membership ID
   * @param {Object} changeData - { new_plan_id, new_billing_cycle }
   */
  changePlan: (id, changeData) => api.put(`/memberships/${id}/change-plan`, changeData),
  
  // ===== ADMIN ROUTES =====
  
  /**
   * Create new membership plan (admin)
   * @param {Object} planData - { name, description, price_monthly, price_yearly, features, highlighted, display_order }
   */
  createPlan: (planData) => api.post('/memberships/plans', planData),
  
  /**
   * Update membership plan (admin)
   * @param {string|number} id - Plan ID
   * @param {Object} planData - Updated plan data
   */
  updatePlan: (id, planData) => api.put(`/memberships/plans/${id}`, planData),
  
  /**
   * Delete membership plan (admin - soft delete)
   * @param {string|number} id - Plan ID
   */
  deletePlan: (id) => api.delete(`/memberships/plans/${id}`),
  
  /**
   * Get all active memberships (admin)
   * @param {Object} params - { page, limit }
   */
  getAllMemberships: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/memberships/admin/memberships${query ? `?${query}` : ''}`);
  },
  
  /**
   * Get membership statistics (admin)
   */
  getStats: () => api.get('/memberships/admin/stats'),
  
  /**
   * Process membership renewals (admin - cron job)
   */
  processRenewals: () => api.post('/memberships/admin/process-renewals'),
};

// ==================== MEMBERSHIP SERVICE ====================
export const membershipService = {
  // ===== PUBLIC METHODS =====
  
  /**
   * Get all active membership plans
   * @returns {Promise} - Array of formatted plans
   */
  getAllPlans: async () => {
    try {
      const response = await membershipAPI.getAllPlans();
      
      if (response.success && response.data) {
        return {
          ...response,
          data: membershipService.formatPlansForDisplay(response.data)
        };
      }
      
      return response;
    } catch (error) {
      console.error('Failed to fetch membership plans:', error);
      throw error;
    }
  },
  
  /**
   * Get plan by ID
   * @param {string|number} id - Plan ID
   * @returns {Promise} - Formatted plan details
   */
  getPlanById: async (id) => {
    try {
      const response = await membershipAPI.getPlanById(id);
      
      if (response.success && response.data) {
        return {
          ...response,
          data: membershipService.formatPlanForDisplay(response.data)
        };
      }
      
      return response;
    } catch (error) {
      console.error(`Failed to fetch plan ${id}:`, error);
      throw error;
    }
  },
  
  // ===== MEMBER METHODS =====
  
  /**
   * Purchase a membership (UPDATED for Paystack)
   * @param {Object} data - { plan_id, billing_cycle, auto_renew }
   * @returns {Promise} - Returns Paystack authorization URL
   */
  purchaseMembership: async (data) => {
    try {
      // Ensure plan_id is a number
      const payload = {
        plan_id: parseInt(data.plan_id),
        billing_cycle: data.billing_cycle,
        auto_renew: data.auto_renew !== undefined ? data.auto_renew : true
      };
      
      const response = await membershipAPI.purchase(payload);
      
      // Paystack response contains authorization_url to redirect to
      if (response.success && response.data?.authorization_url) {
        return response;
      }
      
      return response;
    } catch (error) {
      console.error('Failed to purchase membership:', error);
      throw error;
    }
  },
  
  /**
   * Get current user's active membership
   * @returns {Promise} - Formatted active membership with trial info
   */
  getMyMembership: async () => {
    try {
      const response = await membershipAPI.getMyMembership();
      
      if (response.success && response.data) {
        return {
          ...response,
          data: membershipService.formatMembershipForDisplay(response.data)
        };
      }
      
      return response;
    } catch (error) {
      console.error('Failed to fetch my membership:', error);
      throw error;
    }
  },
  
  /**
   * Get user's membership history
   * @param {Object} params - { page, limit }
   * @returns {Promise} - Paginated membership history
   */
  getMyHistory: async (params = {}) => {
    try {
      const response = await membershipAPI.getMyHistory(params);
      
      if (response.success && response.data?.memberships) {
        return {
          ...response,
          data: {
            ...response.data,
            memberships: response.data.memberships.map(m => 
              membershipService.formatMembershipForDisplay(m)
            )
          }
        };
      }
      
      return response;
    } catch (error) {
      console.error('Failed to fetch membership history:', error);
      throw error;
    }
  },
  
  /**
   * Cancel membership
   * @param {string|number} id - Membership ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise} - Cancellation confirmation
   */
  cancelMembership: async (id, reason = '') => {
    try {
      const response = await membershipAPI.cancel(id, reason);
      return response;
    } catch (error) {
      console.error(`Failed to cancel membership ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Toggle auto-renew
   * @param {string|number} id - Membership ID
   * @returns {Promise} - Updated membership
   */
  toggleAutoRenew: async (id) => {
    try {
      const response = await membershipAPI.toggleAutoRenew(id);
      return response;
    } catch (error) {
      console.error(`Failed to toggle auto-renew for membership ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Change plan (upgrade/downgrade)
   * @param {string|number} id - Membership ID
   * @param {Object} data - { new_plan_id, new_billing_cycle }
   * @returns {Promise} - Updated membership
   */
  changePlan: async (id, data) => {
    try {
      const payload = {
        new_plan_id: parseInt(data.new_plan_id),
        new_billing_cycle: data.new_billing_cycle
      };
      
      const response = await membershipAPI.changePlan(id, payload);
      return response;
    } catch (error) {
      console.error(`Failed to change plan for membership ${id}:`, error);
      throw error;
    }
  },
  
  // ===== ADMIN METHODS =====
  
  /**
   * Create new membership plan (admin)
   * @param {Object} planData - Plan data
   * @returns {Promise} - Created plan
   */
  createPlan: async (planData) => {
    try {
      const payload = {
        name: planData.name,
        description: planData.description || '',
        price_monthly: parseFloat(planData.price_monthly),
        price_yearly: parseFloat(planData.price_yearly),
        features: planData.features || [],
        highlighted: planData.highlighted || false,
        display_order: planData.display_order || 0
      };
      
      const response = await membershipAPI.createPlan(payload);
      return response;
    } catch (error) {
      console.error('Failed to create membership plan:', error);
      throw error;
    }
  },
  
  /**
   * Update membership plan (admin)
   * @param {string|number} id - Plan ID
   * @param {Object} planData - Updated plan data
   * @returns {Promise} - Updated plan
   */
  updatePlan: async (id, planData) => {
    try {
      const response = await membershipAPI.updatePlan(id, planData);
      return response;
    } catch (error) {
      console.error(`Failed to update plan ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete membership plan (admin)
   * @param {string|number} id - Plan ID
   * @returns {Promise} - Deleted plan confirmation
   */
  deletePlan: async (id) => {
    try {
      const response = await membershipAPI.deletePlan(id);
      return response;
    } catch (error) {
      console.error(`Failed to delete plan ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get all active memberships (admin)
   * @param {Object} params - { page, limit }
   * @returns {Promise} - Paginated memberships
   */
  getAllMemberships: async (params = {}) => {
    try {
      const response = await membershipAPI.getAllMemberships(params);
      
      if (response.success && response.data?.memberships) {
        return {
          ...response,
          data: {
            ...response.data,
            memberships: response.data.memberships.map(m => 
              membershipService.formatMembershipForDisplay(m)
            )
          }
        };
      }
      
      return response;
    } catch (error) {
      console.error('Failed to fetch all memberships:', error);
      throw error;
    }
  },
  
  /**
   * Get membership statistics (admin)
   * @returns {Promise} - Membership statistics
   */
  getStats: async () => {
    try {
      const response = await membershipAPI.getStats();
      return response;
    } catch (error) {
      console.error('Failed to fetch membership statistics:', error);
      throw error;
    }
  },
  
  /**
   * Process renewals (admin - cron job)
   * @returns {Promise} - Processing results
   */
  processRenewals: async () => {
    try {
      const response = await membershipAPI.processRenewals();
      return response;
    } catch (error) {
      console.error('Failed to process renewals:', error);
      throw error;
    }
  },
  
  // ===== FORMATTING & UTILITIES =====
  
  /**
   * Format plan for display
   * @param {Object} plan - Raw plan data from API
   * @returns {Object} - Formatted plan with price object
   */
  formatPlanForDisplay: (plan) => {
    if (!plan) return null;
    
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description || '',
      price: {
        monthly: parseFloat(plan.price_monthly || plan.price?.monthly || 0),
        yearly: parseFloat(plan.price_yearly || plan.price?.yearly || 0)
      },
      features: Array.isArray(plan.features) ? plan.features : [],
      highlighted: plan.highlighted || false,
      display_order: plan.display_order || 0,
      status: plan.status || 'active'
    };
  },
  
  /**
   * Format multiple plans for display
   * @param {Array} plans - Array of raw plan data
   * @returns {Array} - Array of formatted plans
   */
  formatPlansForDisplay: (plans = []) => {
    if (!Array.isArray(plans)) return [];
    return plans
      .map(plan => membershipService.formatPlanForDisplay(plan))
      .filter(plan => plan !== null)
      .sort((a, b) => a.display_order - b.display_order);
  },
  
  /**
   * Format membership for display with trial support
   * @param {Object} membership - Raw membership data
   * @returns {Object} - Formatted membership with trial info
   */
  formatMembershipForDisplay: (membership) => {
    if (!membership) return null;
    
    const startDate = new Date(membership.start_date);
    const endDate = new Date(membership.end_date);
    const today = new Date();
    
    const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    
    // Check if this is a trial membership
    const isTrial = membership.plan_name === '7-Day Free Trial' || 
                    membership.billing_cycle === 'trial' ||
                    membership.isTrial === true;
    
    const isExpired = endDate < today;
    
    return {
      id: membership.id,
      membership_number: membership.membership_number,
      plan_id: membership.plan_id,
      plan_name: membership.plan_name || 'Unknown Plan',
      billing_cycle: membership.billing_cycle,
      price_paid: parseFloat(membership.price_paid),
      start_date: membership.start_date,
      end_date: membership.end_date,
      status: membership.status,
      auto_renew: membership.auto_renew || false,
      days_remaining: daysRemaining > 0 ? daysRemaining : 0,
      is_expired: isExpired,
      is_active: membership.status === 'active' && !isExpired,
      formatted_start: membershipService.formatDate(membership.start_date),
      formatted_end: membershipService.formatDate(membership.end_date),
      
      // Trial-specific fields
      isTrial,
      trial_ends: isTrial ? membership.end_date : null,
      trial_expired: isTrial ? isExpired : false,
      requires_upgrade: isTrial ? isExpired : false
    };
  },
  
  /**
   * Format date to readable string
   * @param {string} dateString - ISO date string
   * @returns {string} - Formatted date (MMM DD, YYYY)
   */
  formatDate: (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  },
  
  /**
   * Get price display string
   * @param {Object} plan - Plan object
   * @param {string} cycle - 'monthly' or 'yearly'
   * @returns {string} - Formatted price string
   */
  getPriceDisplay: (plan, cycle = 'monthly') => {
    if (!plan) return 'KSH 0';
    const price = cycle === 'monthly' 
      ? plan.price?.monthly || plan.price_monthly 
      : plan.price?.yearly || plan.price_yearly;
    return `KSH ${price}/${cycle === 'monthly' ? 'mo' : 'yr'}`;
  },
  
  /**
   * Get status badge color
   * @param {string} status - Membership status
   * @returns {Object} - Tailwind color classes
   */
  getStatusColor: (status) => {
    const colors = {
      'active': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      'expired': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
      'default': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
    };
    return colors[status] || colors.default;
  },
  
  /**
   * Calculate savings for yearly vs monthly
   * @param {Object} plan - Plan object
   * @returns {Object} - Savings info
   */
  calculateYearlySavings: (plan) => {
    if (!plan) return { amount: 0, percentage: 0, display: '' };
    
    const monthly = parseFloat(plan.price?.monthly || plan.price_monthly || 0);
    const yearly = parseFloat(plan.price?.yearly || plan.price_yearly || 0);
    
    if (!monthly || !yearly) return { amount: 0, percentage: 0, display: '' };
    
    const monthlyTotal = monthly * 12;
    const savings = monthlyTotal - yearly;
    const percentage = Math.round((savings / monthlyTotal) * 100);
    
    return {
      amount: savings,
      percentage,
      display: `Save KSH ${savings}/year (${percentage}%)`
    };
  },
  
  /**
   * Get recommended plan
   * @param {Array} plans - Array of plans
   * @returns {Object|null} - Recommended plan (highlighted or first)
   */
  getRecommendedPlan: (plans = []) => {
    if (!plans.length) return null;
    return plans.find(p => p.highlighted) || plans[0];
  },
  
  // ===== FORM VALIDATION =====
  
  /**
   * Validate membership purchase form
   * @param {Object} formData - { plan_id, billing_cycle, auto_renew }
   * @returns {Object} - Validation result
   */
  validatePurchaseForm: (formData) => {
    const errors = {};
    
    if (!formData.plan_id) {
      errors.plan_id = 'Please select a membership plan';
    }
    
    if (!formData.billing_cycle) {
      errors.billing_cycle = 'Please select billing cycle';
    } else if (!['monthly', 'yearly'].includes(formData.billing_cycle)) {
      errors.billing_cycle = 'Invalid billing cycle';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },
  
  /**
   * Get initial purchase form data
   * @returns {Object} - Initial form data
   */
  getInitialPurchaseForm: () => ({
    plan_id: '',
    billing_cycle: 'monthly',
    auto_renew: true
  }),
  
  /**
   * Validate membership plan form (admin)
   * @param {Object} formData - Plan form data
   * @returns {Object} - Validation result
   */
  validatePlanForm: (formData) => {
    const errors = {};
    
    if (!formData.name?.trim()) {
      errors.name = 'Plan name is required';
    }
    
    if (!formData.price_monthly || formData.price_monthly <= 0) {
      errors.price_monthly = 'Monthly price must be greater than 0';
    }
    
    if (!formData.price_yearly || formData.price_yearly <= 0) {
      errors.price_yearly = 'Yearly price must be greater than 0';
    }
    
    if (!formData.features || formData.features.length === 0) {
      errors.features = 'At least one feature is required';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },
  
  /**
   * Get initial plan form data (admin)
   * @returns {Object} - Initial form data
   */
  getInitialPlanForm: () => ({
    name: '',
    description: '',
    price_monthly: '',
    price_yearly: '',
    features: [],
    highlighted: false,
    display_order: 0
  }),
  
  // ===== PLAN COMPARISON =====
  
  /**
   * Get plan comparison data
   * @param {Array} plans - Array of plans
   * @returns {Object} - Comparison data
   */
  getPlanComparison: (plans = []) => {
    if (!plans.length) return { features: [], plans: [] };
    
    // Get all unique features
    const allFeatures = new Set();
    plans.forEach(plan => {
      plan.features?.forEach(feature => allFeatures.add(feature));
    });
    
    return {
      features: Array.from(allFeatures),
      plans: plans.map(plan => ({
        id: plan.id,
        name: plan.name,
        price_monthly: plan.price?.monthly || plan.price_monthly,
        price_yearly: plan.price?.yearly || plan.price_yearly,
        hasFeature: (feature) => plan.features?.includes(feature) || false,
        highlighted: plan.highlighted
      }))
    };
  },
  
  /**
   * Get plan by billing cycle
   * @param {Object} plan - Plan object
   * @param {string} cycle - 'monthly' or 'yearly'
   * @returns {number} - Price
   */
  getPlanPrice: (plan, cycle = 'monthly') => {
    if (!plan) return 0;
    return cycle === 'monthly' 
      ? parseFloat(plan.price?.monthly || plan.price_monthly || 0)
      : parseFloat(plan.price?.yearly || plan.price_yearly || 0);
  }
};

// Default export
export default membershipService;
import { bookingAPI, feedbackAPI } from './api.js';
// ==================== BOOKING SERVICE ====================
export const bookingService = {
  // ==================== MAIN BOOKING OPERATIONS ====================

  /**
   * Create a new booking
   * @param {Object} bookingData - Booking data
   * @returns {Promise} - Created booking
   */
  createBooking: async (bookingData) => {
    try {
      const response = await bookingAPI.create(bookingData);
      return response;
    } catch (error) {
      console.error('Failed to create booking:', error);
      throw error;
    }
  },

  /**
   * Get all bookings for a user
   * @param {string|number} userId - User ID
   * @param {Object} params - Query parameters (status, page, limit, upcoming, past, from_date, to_date)
   * @returns {Promise} - User's bookings
   */
  getUserBookings: async (userId, params = {}) => {
    try {
      const response = await bookingAPI.getByUser(userId, params);
      return response;
    } catch (error) {
      console.error('Failed to fetch user bookings:', error);
      throw error;
    }
  },

  /**
   * Get booking by ID
   * @param {string|number} id - Booking ID
   * @returns {Promise} - Booking object
   */
  getBookingById: async (id) => {
    try {
      const response = await bookingAPI.getById(id);
      return response;
    } catch (error) {
      console.error(`Failed to fetch booking ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cancel a booking (without reason - backward compatibility)
   * @param {string|number} id - Booking ID
   * @returns {Promise} - Cancelled booking
   */
  cancelBooking: async (id) => {
    try {
      const response = await bookingAPI.cancel(id);
      return response;
    } catch (error) {
      console.error(`Failed to cancel booking ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cancel a booking with reason
   * @param {string|number} id - Booking ID
   * @param {string} reason - Cancellation reason
   * @returns {Promise} - Cancelled booking
   */
  cancelBookingWithReason: async (id, reason) => {
    try {
      const response = await bookingAPI.cancel(id, reason);
      return response;
    } catch (error) {
      console.error(`Failed to cancel booking ${id}:`, error);
      throw error;
    }
  },

  /**
   * Reschedule a booking
   * @param {string|number} id - Booking ID
   * @param {string} newDate - New date (YYYY-MM-DD)
   * @param {string} newTime - New time
   * @returns {Promise} - Rescheduled booking
   */
  rescheduleBooking: async (id, newDate, newTime) => {
    try {
      const response = await bookingAPI.reschedule(id, { 
        new_date: newDate, 
        new_time: newTime 
      });
      return response;
    } catch (error) {
      console.error(`Failed to reschedule booking ${id}:`, error);
      throw error;
    }
  },

  /**
   * Check trainer availability
   * @param {string|number} trainerId - Trainer ID
   * @param {string} date - Date to check (YYYY-MM-DD)
   * @returns {Promise} - Available time slots
   */
  checkAvailability: async (trainerId, date) => {
    try {
      const response = await bookingAPI.checkAvailability(trainerId, date);
      return response;
    } catch (error) {
      console.error('Failed to check availability:', error);
      throw error;
    }
  },

  /**
   * Get all bookings (admin only)
   * @param {Object} params - Query parameters (status, page, limit, member_id, trainer_id, from_date, to_date)
   * @returns {Promise} - All bookings with pagination
   */
  getAllBookings: async (params = {}) => {
    try {
      const response = await bookingAPI.getAll(params);
      return response;
    } catch (error) {
      console.error('Failed to fetch all bookings:', error);
      throw error;
    }
  },

  /**
   * Get bookings by trainer (admin/trainer)
   * @param {string|number} trainerId - Trainer ID
   * @param {Object} params - Query parameters (status, page, limit, date)
   * @returns {Promise} - Trainer's bookings
   */
  getTrainerBookings: async (trainerId, params = {}) => {
    try {
      const response = await bookingAPI.getByTrainer(trainerId, params);
      return response;
    } catch (error) {
      console.error(`Failed to fetch bookings for trainer ${trainerId}:`, error);
      throw error;
    }
  },

  /**
   * Mark booking as completed (trainer/admin)
   * @param {string|number} id - Booking ID
   * @returns {Promise} - Completed booking
   */
  completeBooking: async (id) => {
    try {
      const response = await bookingAPI.complete(id);
      return response;
    } catch (error) {
      console.error(`Failed to complete booking ${id}:`, error);
      throw error;
    }
  },

  /**
   * Confirm a booking (admin/trainer)
   * @param {string|number} id - Booking ID
   * @returns {Promise} - Confirmed booking
   */
  confirmBooking: async (id) => {
    try {
      const response = await bookingAPI.confirm(id);
      return response;
    } catch (error) {
      console.error(`Failed to confirm booking ${id}:`, error);
      throw error;
    }
  },

  /**
   * Mark booking as no-show (admin/trainer)
   * @param {string|number} id - Booking ID
   * @returns {Promise} - No-show booking
   */
  markAsNoShow: async (id) => {
    try {
      const response = await bookingAPI.noShow(id);
      return response;
    } catch (error) {
      console.error(`Failed to mark booking ${id} as no-show:`, error);
      throw error;
    }
  },

  /**
   * Update booking status (admin)
   * @param {string|number} id - Booking ID
   * @param {string} status - New status
   * @param {string} reason - Reason (required for cancellation)
   * @returns {Promise} - Updated booking
   */
  updateBookingStatus: async (id, status, reason = '') => {
    try {
      const response = await bookingAPI.updateStatus(id, { status, reason });
      return response;
    } catch (error) {
      console.error(`Failed to update booking ${id} status:`, error);
      throw error;
    }
  },

  /**
   * Delete a booking (admin only - soft delete)
   * @param {string|number} id - Booking ID
   * @returns {Promise} - Deleted booking
   */
  deleteBooking: async (id) => {
    try {
      const response = await bookingAPI.delete(id);
      return response;
    } catch (error) {
      console.error(`Failed to delete booking ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get booking statistics (admin)
   * @returns {Promise} - Booking statistics
   */
  getBookingStats: async () => {
    try {
      const response = await bookingAPI.getStats();
      return response;
    } catch (error) {
      console.error('Failed to fetch booking stats:', error);
      throw error;
    }
  },

  // ==================== AVAILABILITY ====================

  /**
   * Create availability slots for a trainer
   * @param {Object} availabilityData - { trainer_id, date, times }
   * @returns {Promise} - Created availability slots
   */
  createAvailabilitySlots: async (availabilityData) => {
    try {
      const response = await bookingAPI.createAvailabilitySlots(availabilityData);
      return response;
    } catch (error) {
      console.error('Failed to create availability slots:', error);
      throw error;
    }
  },

  // ==================== BOOKING HISTORY ====================

  /**
   * Get booking history/audit trail
   * @param {string|number} bookingId - Booking ID
   * @returns {Promise} - Booking history
   */
  getBookingHistory: async (bookingId) => {
    try {
      const response = await bookingAPI.getHistory(bookingId);
      return response;
    } catch (error) {
      console.error(`Failed to fetch booking history for ${bookingId}:`, error);
      throw error;
    }
  },

  // ==================== FEEDBACK ====================

  /**
   * Submit feedback for a completed booking
   * @param {Object} feedbackData - { booking_id, member_id, trainer_id, rating, review, would_recommend }
   * @returns {Promise} - Submitted feedback
   */
  submitFeedback: async (feedbackData) => {
    try {
      const response = await feedbackAPI.submit(feedbackData);
      return response;
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw error;
    }
  },

  /**
   * Get feedback by trainer ID
   * @param {string|number} trainerId - Trainer ID
   * @param {Object} params - Query parameters (page, limit)
   * @returns {Promise} - Trainer feedback
   */
  getTrainerFeedback: async (trainerId, params = {}) => {
    try {
      const response = await feedbackAPI.getByTrainer(trainerId, params);
      return response;
    } catch (error) {
      console.error(`Failed to fetch feedback for trainer ${trainerId}:`, error);
      throw error;
    }
  },

  /**
   * Get feedback by booking ID
   * @param {string|number} bookingId - Booking ID
   * @returns {Promise} - Booking feedback
   */
  getFeedbackByBooking: async (bookingId) => {
    try {
      const response = await feedbackAPI.getByBooking(bookingId);
      return response;
    } catch (error) {
      console.error(`Failed to fetch feedback for booking ${bookingId}:`, error);
      throw error;
    }
  },

  /**
   * Get trainer rating
   * @param {string|number} trainerId - Trainer ID
   * @returns {Promise} - Trainer rating statistics
   */
  getTrainerRating: async (trainerId) => {
    try {
      const response = await feedbackAPI.getTrainerRating(trainerId);
      return response;
    } catch (error) {
      console.error(`Failed to fetch rating for trainer ${trainerId}:`, error);
      throw error;
    }
  },

  // ==================== PAGINATED METHODS ====================

  /**
   * Get user bookings with pagination and filters
   * @param {string|number} userId - User ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {Object} filters - Filters (status, upcoming, past, from_date, to_date)
   * @returns {Promise} - User's bookings with pagination
   */
  getUserBookingsPaginated: async (userId, page = 1, limit = 10, filters = {}) => {
    try {
      const params = { page, limit, ...filters };
      const response = await bookingAPI.getByUser(userId, params);
      return response;
    } catch (error) {
      console.error('Failed to fetch user bookings:', error);
      throw error;
    }
  },

  /**
   * Get trainer bookings with pagination
   * @param {string|number} trainerId - Trainer ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {Object} filters - Filters (status, date)
   * @returns {Promise} - Trainer's bookings with pagination
   */
  getTrainerBookingsPaginated: async (trainerId, page = 1, limit = 10, filters = {}) => {
    try {
      const params = { page, limit, ...filters };
      const response = await bookingAPI.getByTrainer(trainerId, params);
      return response;
    } catch (error) {
      console.error(`Failed to fetch bookings for trainer ${trainerId}:`, error);
      throw error;
    }
  },

  // ==================== FORMATTING & UTILITIES ====================

  /**
   * Format booking data for display - handles both API response formats
   * @param {Object} booking - Raw booking data from API
   * @returns {Object} - Formatted booking data
   */
  formatBookingForDisplay: (booking) => {
    if (!booking) return null;
    
    return {
      id: booking.id,
      booking_number: booking.booking_number,
      serviceId: booking.service_id || booking.serviceId,
      serviceName: booking.service_name || booking.service_title || 'Training Session',
      trainerId: booking.trainer_id || booking.trainerId,
      trainerName: booking.trainer_name || booking.trainerName || 'Assigned Trainer',
      trainerImage: booking.trainer_image,
      memberId: booking.member_id || booking.memberId,
      memberName: booking.member_name || booking.memberName,
      memberEmail: booking.member_email,
      
      // Handle both camelCase and snake_case
      booking_date: booking.booking_date || booking.date,
      booking_time: booking.booking_time || booking.time,
      date: booking.booking_date || booking.date,
      time: booking.booking_time || booking.time,
      
      sessionType: booking.session_type || booking.sessionType || 'one-on-one',
      duration_minutes: booking.duration_minutes || 60,
      
      status: booking.status || 'pending',
      payment_status: booking.payment_status || 'unpaid',
      
      notes: booking.notes || '',
      special_requests: booking.special_requests || '',
      cancellation_reason: booking.cancellation_reason,
      reschedule_count: booking.reschedule_count || 0,
      
      created_at: booking.created_at,
      updated_at: booking.updated_at,
      cancelled_at: booking.cancelled_at,
      completed_at: booking.completed_at,
      
      // Joined fields
      service_title: booking.service_title,
      trainer_specialty: booking.trainer_specialty,
      member_phone: booking.member_phone,
      
      // Feedback flag
      feedback_provided: booking.feedback_provided || false
    };
  },

  /**
   * Format multiple bookings for display
   * @param {Array} bookings - Array of raw booking data
   * @returns {Array} - Array of formatted bookings
   */
  formatBookingsForDisplay: (bookings = []) => {
    return bookings.map(booking => bookingService.formatBookingForDisplay(booking));
  },

  /**
   * Get status badge color
   * @param {string} status - Booking status
   * @returns {Object} - Color scheme for status badge
   */
  getStatusColor: (status) => {
    const colorMap = {
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
      'confirmed': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      'cancelled': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
      'completed': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      'no-show': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
      'default': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
    };
    return colorMap[status] || colorMap.default;
  },

  /**
   * Get session type badge color
   * @param {string} sessionType - Session type
   * @returns {Object} - Color scheme for session type
   */
  getSessionTypeColor: (sessionType) => {
    const colorMap = {
      'one-on-one': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
      'group': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
      'virtual': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      'default': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
    };
    return colorMap[sessionType] || colorMap.default;
  },

  /**
   * Get payment status badge color
   * @param {string} status - Payment status
   * @returns {Object} - Color scheme
   */
  getPaymentStatusColor: (status) => {
    const colorMap = {
      'paid': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      'unpaid': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
      'refunded': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
      'failed': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
      'default': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
    };
    return colorMap[status] || colorMap.default;
  },

  /**
   * Validate booking form data
   * @param {Object} formData - Booking form data
   * @returns {Object} - Validation result
   */
  validateBookingForm: (formData) => {
    const errors = {};
    
    if (!formData.trainerId) {
      errors.trainerId = 'Please select a trainer';
    }
    
    if (!formData.date) {
      errors.date = 'Please select a date';
    }
    
    if (!formData.time) {
      errors.time = 'Please select a time';
    }
    
    // Check if date is in the past
    if (formData.date) {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.date = 'Date cannot be in the past';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Get initial booking form data
   * @returns {Object} - Initial form data
   */
  getInitialFormData: () => ({
    trainerId: '',
    date: '',
    time: '',
    sessionType: 'one-on-one',
    notes: ''
  }),

  /**
   * Generate available time slots
   * @param {Array} bookedSlots - Array of booked time slots
   * @returns {Array} - Array of available time slots
   */
  generateTimeSlots: (bookedSlots = []) => {
    const allSlots = [
      '09:00 AM', '10:00 AM', '11:00 AM',
      '12:00 PM', '01:00 PM', '02:00 PM',
      '03:00 PM', '04:00 PM', '05:00 PM',
      '06:00 PM', '07:00 PM'
    ];
    
    return allSlots.map(time => ({
      time,
      available: !bookedSlots.includes(time)
    }));
  },

  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   * @returns {string} - Formatted date
   */
  formatDate: (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  },

  /**
   * Get upcoming bookings (includes pending and confirmed)
   * @param {Array} bookings - Array of bookings
   * @returns {Array} - Upcoming bookings
   */
  getUpcomingBookings: (bookings = []) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return bookings
      .filter(booking => {
        const bookingDate = new Date(booking.booking_date || booking.date);
        return bookingDate >= today && 
               ['pending', 'confirmed'].includes(booking.status);
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.booking_date || a.date} ${a.booking_time || a.time}`);
        const dateB = new Date(`${b.booking_date || b.date} ${b.booking_time || b.time}`);
        return dateA - dateB;
      });
  },

  /**
   * Get past bookings
   * @param {Array} bookings - Array of bookings
   * @returns {Array} - Past bookings
   */
  getPastBookings: (bookings = []) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return bookings
      .filter(booking => {
        const bookingDate = new Date(booking.booking_date || booking.date);
        return bookingDate < today || 
               ['completed', 'cancelled', 'no-show'].includes(booking.status);
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.booking_date || a.date} ${a.booking_time || a.time}`);
        const dateB = new Date(`${b.booking_date || b.date} ${b.booking_time || b.time}`);
        return dateB - dateA;
      });
  },

  /**
   * Get bookings by status
   * @param {Array} bookings - Array of bookings
   * @param {string} status - Status to filter by
   * @returns {Array} - Filtered bookings
   */
  getBookingsByStatus: (bookings = [], status) => {
    return bookings.filter(booking => booking.status === status);
  },

  /**
   * Calculate total hours trained
   * @param {Array} bookings - Array of bookings
   * @returns {number} - Total hours
   */
  getTotalHoursTrained: (bookings = []) => {
    return bookings
      .filter(booking => booking.status === 'completed')
      .reduce((total, booking) => {
        return total + (booking.duration_minutes || 60);
      }, 0) / 60;
  },

  /**
   * Check if booking can be cancelled
   * @param {Object} booking - Booking object
   * @returns {boolean} - Whether booking can be cancelled
   */
  canCancel: (booking) => {
    if (!booking) return false;
    const bookingDate = new Date(booking.booking_date || booking.date);
    const today = new Date();
    return bookingDate >= today && 
           !['cancelled', 'completed', 'no-show'].includes(booking.status);
  },

  /**
   * Check if booking can be rescheduled
   * @param {Object} booking - Booking object
   * @returns {boolean} - Whether booking can be rescheduled
   */
  canReschedule: (booking) => {
    if (!booking) return false;
    const bookingDate = new Date(booking.booking_date || booking.date);
    const today = new Date();
    return bookingDate >= today && 
           booking.status === 'confirmed';
  },

  /**
   * Check if feedback can be provided
   * @param {Object} booking - Booking object
   * @returns {boolean} - Whether feedback can be provided
   */
  canProvideFeedback: (booking) => {
    return booking?.status === 'completed' && !booking.feedback_provided;
  },

  /**
   * Format feedback data for display
   * @param {Object} feedback - Raw feedback data
   * @returns {Object} - Formatted feedback
   */
  formatFeedbackForDisplay: (feedback) => {
    if (!feedback) return null;
    
    return {
      id: feedback.id,
      bookingId: feedback.booking_id,
      memberId: feedback.member_id,
      trainerId: feedback.trainer_id,
      trainerName: feedback.trainer_name,
      memberName: feedback.member_name,
      rating: feedback.rating,
      review: feedback.review || '',
      wouldRecommend: feedback.would_recommend,
      createdAt: feedback.created_at,
      formattedDate: bookingService.formatDate(feedback.created_at)
    };
  },

  /**
   * Get rating stars array
   * @param {number} rating - Rating (1-5)
   * @returns {Array} - Array of star objects
   */
  getRatingStars: (rating) => {
    return [1, 2, 3, 4, 5].map(star => ({
      filled: star <= rating,
      half: false
    }));
  },

  /**
   * Calculate average rating
   * @param {Array} feedbacks - Array of feedback objects
   * @returns {number} - Average rating
   */
  getAverageRating: (feedbacks = []) => {
    if (feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((total, f) => total + f.rating, 0);
    return Math.round((sum / feedbacks.length) * 10) / 10;
  }
};

// Default export
export default bookingService;
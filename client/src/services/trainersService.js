// trainersService.js - Frontend Trainer API Service
import { trainerAPI } from './api.js'; // Import directly, not the default export

// ==================== TRAINERS API ====================
export const trainersService = {
  /**
   * Get all trainers with optional filters and pagination
   * @param {Object} params - Query parameters
   * @returns {Promise} - Array of trainers with pagination
   */
  getAllTrainers: async (params = {}) => {
    try {
      const response = await trainerAPI.getAll(params);
      return response;
    } catch (error) {
      console.error('Failed to fetch trainers:', error);
      throw error;
    }
  },

  /**
   * Get a single trainer by ID
   * @param {number|string} id - Trainer ID
   * @returns {Promise} - Trainer object
   */
  getTrainerById: async (id) => {
    try {
      const response = await trainerAPI.getById(id);
      return response;
    } catch (error) {
      console.error(`Failed to fetch trainer ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new trainer (admin only)
   * @param {Object} trainerData - Trainer data
   * @returns {Promise} - Created trainer
   */
  createTrainer: async (trainerData) => {
    try {
      const response = await trainerAPI.create(trainerData);
      return response;
    } catch (error) {
      console.error('Failed to create trainer:', error);
      throw error;
    }
  },

  /**
   * Update a trainer (admin only)
   * @param {number|string} id - Trainer ID
   * @param {Object} trainerData - Updated trainer data
   * @returns {Promise} - Updated trainer
   */
  updateTrainer: async (id, trainerData) => {
    try {
      const response = await trainerAPI.update(id, trainerData);
      return response;
    } catch (error) {
      console.error(`Failed to update trainer ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a trainer (admin only - soft delete)
   * @param {number|string} id - Trainer ID
   * @returns {Promise} - Deleted trainer
   */
  deleteTrainer: async (id) => {
    try {
      const response = await trainerAPI.delete(id);
      return response;
    } catch (error) {
      console.error(`Failed to delete trainer ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get featured trainers
   * @param {number} limit - Number of trainers to return
   * @returns {Promise} - Array of featured trainers
   */
  getFeaturedTrainers: async (limit = 6) => {
    try {
      const response = await trainerAPI.getFeatured(limit);
      return response;
    } catch (error) {
      console.error('Failed to fetch featured trainers:', error);
      throw error;
    }
  },

  /**
   * Get trainers by specialty
   * @param {string} specialty - Trainer specialty
   * @returns {Promise} - Array of trainers in specialty
   */
  getTrainersBySpecialty: async (specialty) => {
    try {
      const response = await trainerAPI.getBySpecialty(specialty);
      return response;
    } catch (error) {
      console.error(`Failed to fetch trainers by specialty ${specialty}:`, error);
      throw error;
    }
  },

  /**
   * Get all available specialties
   * @returns {Promise} - Array of specialty strings
   */
  getSpecialties: async () => {
    try {
      const response = await trainerAPI.getSpecialties();
      return response;
    } catch (error) {
      console.error('Failed to fetch specialties:', error);
      throw error;
    }
  },

  /**
   * Get trainer statistics
   * @returns {Promise} - Trainer statistics object
   */
  getTrainerStats: async () => {
    try {
      const response = await trainerAPI.getStats();
      return response;
    } catch (error) {
      console.error('Failed to fetch trainer stats:', error);
      throw error;
    }
  },

  /**
   * Search trainers by name, specialty, or bio
   * @param {string} query - Search query
   * @param {Object} params - Additional parameters
   * @returns {Promise} - Search results
   */
  searchTrainers: async (query, params = {}) => {
    try {
      const response = await trainerAPI.getAll({
        ...params,
        search: query
      });
      return response;
    } catch (error) {
      console.error('Failed to search trainers:', error);
      throw error;
    }
  },

  /**
   * Format trainer data for display
   * @param {Object} trainer - Raw trainer data from API
   * @returns {Object} - Formatted trainer data
   */
  formatTrainerForDisplay: (trainer) => {
    return {
      id: trainer.id,
      name: trainer.name,
      specialty: trainer.specialty,
      image: trainer.image || 'https://via.placeholder.com/400x500?text=No+Image',
      bio: trainer.bio || 'No bio available.',
      certifications: trainer.certifications || [],
      email: trainer.email,
      phone: trainer.phone,
      socials: trainer.socials || {},
      featured: trainer.featured || false,
      size: trainer.size || 'regular',
      status: trainer.status || 'active'
    };
  },

  /**
   * Format social links for display
   * @param {Object} socials - Social media object
   * @returns {Array} - Array of social media links
   */
  formatSocialLinks: (socials) => {
    const platforms = [
      { key: 'instagram', name: 'Instagram', icon: 'fa-instagram', color: '#E4405F' },
      { key: 'facebook', name: 'Facebook', icon: 'fa-facebook', color: '#1877F2' },
      { key: 'linkedin', name: 'LinkedIn', icon: 'fa-linkedin', color: '#0A66C2' },
      { key: 'x', name: 'X (Twitter)', icon: 'fa-twitter', color: '#000000' },
      { key: 'whatsapp', name: 'WhatsApp', icon: 'fa-whatsapp', color: '#25D366' }
    ];

    return platforms
      .filter(platform => socials[platform.key])
      .map(platform => ({
        ...platform,
        url: socials[platform.key],
        isPhone: platform.key === 'whatsapp' && socials[platform.key].startsWith('+')
      }));
  },

  /**
   * Get trainer image with fallback
   * @param {string} imageUrl - Trainer image URL
   * @param {string} size - Image size ('small', 'medium', 'large')
   * @returns {string} - Image URL
   */
  getTrainerImage: (imageUrl, size = 'medium') => {
    if (!imageUrl) {
      const sizes = {
        small: 'https://via.placeholder.com/150x200?text=No+Image',
        medium: 'https://via.placeholder.com/400x500?text=No+Image',
        large: 'https://via.placeholder.com/600x800?text=No+Image'
      };
      return sizes[size] || sizes.medium;
    }
    return imageUrl;
  },

  /**
   * Validate trainer form data
   * @param {Object} formData - Trainer form data
   * @returns {Object} - Validation result
   */
  validateTrainerForm: (formData) => {
    const errors = {};
    
    if (!formData.name?.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.specialty?.trim()) {
      errors.specialty = 'Specialty is required';
    }
    
    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (formData.bio && formData.bio.length > 1000) {
      errors.bio = 'Bio must be less than 1000 characters';
    }
    
    if (formData.image && !/^https?:\/\/.+/.test(formData.image)) {
      errors.image = 'Image must be a valid URL';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Prepare trainer data for API submission
   * @param {Object} formData - Form data
   * @returns {Object} - Prepared API data
   */
  prepareTrainerData: (formData) => {
    const preparedData = {
      ...formData,
      certifications: Array.isArray(formData.certifications) 
        ? formData.certifications 
        : (formData.certifications || '').split(',').map(cert => cert.trim()).filter(cert => cert),
      socials: {
        instagram: formData.instagram || '',
        facebook: formData.facebook || '',
        linkedin: formData.linkedin || '',
        x: formData.x || '',
        whatsapp: formData.whatsapp || ''
      }
    };
    
    // Remove individual social fields
    delete preparedData.instagram;
    delete preparedData.facebook;
    delete preparedData.linkedin;
    delete preparedData.x;
    delete preparedData.whatsapp;
    
    return preparedData;
  },

  /**
   * Get initial trainer form data
   * @returns {Object} - Initial form data
   */
  getInitialFormData: () => ({
    name: '',
    specialty: '',
    image: '',
    bio: '',
    certifications: [],
    email: '',
    phone: '',
    instagram: '',
    facebook: '',
    linkedin: '',
    x: '',
    whatsapp: '',
    featured: false,
    size: 'regular'
  }),

  /**
   * Map API trainer to form data
   * @param {Object} trainer - API trainer data
   * @returns {Object} - Form data
   */
  mapTrainerToForm: (trainer) => ({
    name: trainer.name || '',
    specialty: trainer.specialty || '',
    image: trainer.image || '',
    bio: trainer.bio || '',
    certifications: trainer.certifications || [],
    email: trainer.email || '',
    phone: trainer.phone || '',
    instagram: trainer.socials?.instagram || '',
    facebook: trainer.socials?.facebook || '',
    linkedin: trainer.socials?.linkedin || '',
    x: trainer.socials?.x || '',
    whatsapp: trainer.socials?.whatsapp || '',
    featured: trainer.featured || false,
    size: trainer.size || 'regular'
  }),

  /**
   * Get specialty color scheme
   * @param {string} specialty - Trainer specialty
   * @returns {Object} - Color scheme
   */
  getSpecialtyColor: (specialty) => {
    const colorMap = {
      'Strength Training': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
      'Cardio & HIIT': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      'Yoga & Flexibility': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
      'Nutrition & Coaching': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
      'Weightlifting': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
      'CrossFit & Conditioning': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
      'default': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
    };
    
    return colorMap[specialty] || colorMap.default;
  }
};

// Default export
export default trainersService;
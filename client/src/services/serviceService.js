// serviceService.js - Frontend Service API Service
import { serviceAPI } from './api.js';

export const serviceService = {
  // ==================== SERVICES ====================
  
  /**
   * Get all services with optional filters and pagination
   * @param {Object} params - Query parameters (page, limit, category, featured, search)
   * @returns {Promise} - Array of services with pagination
   */
  getAllServices: async (params = {}) => {
    try {
      const response = await serviceAPI.getAll(params);
      return response;
    } catch (error) {
      console.error('Failed to fetch services:', error);
      throw error;
    }
  },

  /**
   * Get a single service by ID
   * @param {number|string} id - Service ID
   * @returns {Promise} - Service object
   */
  getServiceById: async (id) => {
    try {
      const response = await serviceAPI.getById(id);
      return response;
    } catch (error) {
      console.error(`Failed to fetch service ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get featured services
   * @param {number} limit - Number of services to return
   * @returns {Promise} - Array of featured services
   */
  getFeaturedServices: async (limit = 4) => {
    try {
      const response = await serviceAPI.getFeatured(limit);
      return response;
    } catch (error) {
      console.error('Failed to fetch featured services:', error);
      throw error;
    }
  },

  /**
   * Get services by category
   * @param {string} category - Service category
   * @returns {Promise} - Array of services in category
   */
  getServicesByCategory: async (category) => {
    try {
      const response = await serviceAPI.getByCategory(category);
      return response;
    } catch (error) {
      console.error(`Failed to fetch services by category ${category}:`, error);
      throw error;
    }
  },

  /**
   * Get service categories with counts
   * @returns {Promise} - Array of categories with service counts
   */
  getServiceCategories: async () => {
    try {
      const response = await serviceAPI.getCategories();
      return response;
    } catch (error) {
      console.error('Failed to fetch service categories:', error);
      throw error;
    }
  },

  /**
   * Get service statistics
   * @returns {Promise} - Service statistics object
   */
  getServiceStats: async () => {
    try {
      const response = await serviceAPI.getStats();
      return response;
    } catch (error) {
      console.error('Failed to fetch service stats:', error);
      throw error;
    }
  },

  // ==================== SERVICE CATEGORIES (for categories section) ====================

  /**
   * Get all service categories with their services
   * @returns {Promise} - Array of categories with nested services
   */
  getAllServiceCategories: async () => {
    try {
      const response = await serviceAPI.getAllServiceCategories();
      return response;
    } catch (error) {
      console.error('Failed to fetch all service categories:', error);
      throw error;
    }
  },

  /**
   * Get service category by ID with its services
   * @param {number|string} id - Category ID
   * @returns {Promise} - Category object with services
   */
  getServiceCategoryById: async (id) => {
    try {
      const response = await serviceAPI.getServiceCategoryById(id);
      return response;
    } catch (error) {
      console.error(`Failed to fetch service category ${id}:`, error);
      throw error;
    }
  },

  // ==================== FORMATTING & UTILITIES ====================

  /**
   * Format service data for display
   * @param {Object} service - Raw service data from API
   * @returns {Object} - Formatted service data
   */
  formatServiceForDisplay: (service) => {
    if (!service) return null;
    
    return {
      id: service.id,
      title: service.title,
      image: service.image || '/images/placeholder-service.jpg',
      description: service.description || 'No description available.',
      category: service.category,
      featured: service.featured || false,
      status: service.status || 'active',
      createdAt: service.created_at,
      updatedAt: service.updated_at
    };
  },

  /**
   * Format multiple services for display
   * @param {Array} services - Array of raw service data
   * @returns {Array} - Array of formatted services
   */
  formatServicesForDisplay: (services = []) => {
    return services.map(service => serviceService.formatServiceForDisplay(service));
  },

  /**
   * Format service category data for display (for categories section)
   * @param {Object} category - Raw category data from API
   * @returns {Object} - Formatted category data
   */
  formatServiceCategoryForDisplay: (category) => {
    if (!category) return null;
    
    return {
      id: category.id,
      category: category.category || category.name,
      services: category.services || []
    };
  },

  /**
   * Format multiple service categories for display
   * @param {Array} categories - Array of raw category data
   * @returns {Array} - Array of formatted categories
   */
  formatServiceCategoriesForDisplay: (categories = []) => {
    return categories.map(cat => serviceService.formatServiceCategoryForDisplay(cat));
  },

  /**
   * Get service image with fallback
   * @param {string} imageUrl - Service image URL
   * @param {string} size - Image size ('small', 'medium', 'large')
   * @returns {string} - Image URL
   */
  getServiceImage: (imageUrl, size = 'medium') => {
    if (!imageUrl) {
      const sizes = {
        small: '/images/placeholder-service-small.jpg',
        medium: '/images/placeholder-service.jpg',
        large: '/images/placeholder-service-large.jpg'
      };
      return sizes[size] || sizes.medium;
    }
    return imageUrl;
  },

  /**
   * Get category color scheme
   * @param {string} category - Service category
   * @returns {Object} - Color scheme
   */
  getCategoryColor: (category) => {
    const colorMap = {
      'Training': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', accent: 'bg-blue-500' },
      'Wellness': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', accent: 'bg-green-500' },
      'Facilities': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', accent: 'bg-purple-500' },
      'default': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200', accent: 'bg-gray-500' }
    };
    
    return colorMap[category] || colorMap.default;
  },

  // ==================== SEARCH & FILTER ====================

  /**
   * Search services by query
   * @param {string} query - Search query
   * @param {Object} params - Additional parameters
   * @returns {Promise} - Search results
   */
  searchServices: async (query, params = {}) => {
    try {
      const response = await serviceAPI.getAll({
        ...params,
        search: query
      });
      return response;
    } catch (error) {
      console.error('Failed to search services:', error);
      throw error;
    }
  },

  /**
   * Filter services by category
   * @param {string} category - Category to filter by
   * @param {Object} params - Additional parameters
   * @returns {Promise} - Filtered services
   */
  filterByCategory: async (category, params = {}) => {
    try {
      const response = await serviceAPI.getAll({
        ...params,
        category
      });
      return response;
    } catch (error) {
      console.error(`Failed to filter services by category ${category}:`, error);
      throw error;
    }
  },

  /**
   * Filter services by featured status
   * @param {boolean} featured - Featured status
   * @param {Object} params - Additional parameters
   * @returns {Promise} - Filtered services
   */
  filterByFeatured: async (featured = true, params = {}) => {
    try {
      const response = await serviceAPI.getAll({
        ...params,
        featured
      });
      return response;
    } catch (error) {
      console.error('Failed to filter featured services:', error);
      throw error;
    }
  },

  // ==================== ADMIN ONLY ====================

  /**
   * Create a new service (admin only)
   * @param {Object} serviceData - Service data
   * @returns {Promise} - Created service
   */
  createService: async (serviceData) => {
    try {
      const response = await serviceAPI.create(serviceData);
      return response;
    } catch (error) {
      console.error('Failed to create service:', error);
      throw error;
    }
  },

  /**
   * Update a service (admin only)
   * @param {number|string} id - Service ID
   * @param {Object} serviceData - Updated service data
   * @returns {Promise} - Updated service
   */
  updateService: async (id, serviceData) => {
    try {
      const response = await serviceAPI.update(id, serviceData);
      return response;
    } catch (error) {
      console.error(`Failed to update service ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a service (admin only - soft delete)
   * @param {number|string} id - Service ID
   * @returns {Promise} - Deleted service
   */
  deleteService: async (id) => {
    try {
      const response = await serviceAPI.delete(id);
      return response;
    } catch (error) {
      console.error(`Failed to delete service ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a service category (admin only)
   * @param {Object} categoryData - Category data
   * @returns {Promise} - Created category
   */
  createServiceCategory: async (categoryData) => {
    try {
      const response = await serviceAPI.createCategory(categoryData);
      return response;
    } catch (error) {
      console.error('Failed to create service category:', error);
      throw error;
    }
  },

  /**
   * Update a service category (admin only)
   * @param {number|string} id - Category ID
   * @param {Object} categoryData - Updated category data
   * @returns {Promise} - Updated category
   */
  updateServiceCategory: async (id, categoryData) => {
    try {
      const response = await serviceAPI.updateCategory(id, categoryData);
      return response;
    } catch (error) {
      console.error(`Failed to update service category ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a service category (admin only - soft delete)
   * @param {number|string} id - Category ID
   * @returns {Promise} - Deleted category
   */
  deleteServiceCategory: async (id) => {
    try {
      const response = await serviceAPI.deleteCategory(id);
      return response;
    } catch (error) {
      console.error(`Failed to delete service category ${id}:`, error);
      throw error;
    }
  },

  /**
   * Add service to category (admin only)
   * @param {Object} data - { category_id, service_name, display_order }
   * @returns {Promise} - Created category item
   */
  addServiceToCategory: async (data) => {
    try {
      const response = await serviceAPI.addServiceToCategory(data);
      return response;
    } catch (error) {
      console.error('Failed to add service to category:', error);
      throw error;
    }
  },

  /**
   * Update service category item (admin only)
   * @param {number|string} id - Category item ID
   * @param {Object} data - Updated item data
   * @returns {Promise} - Updated category item
   */
  updateServiceCategoryItem: async (id, data) => {
    try {
      const response = await serviceAPI.updateCategoryItem(id, data);
      return response;
    } catch (error) {
      console.error(`Failed to update service category item ${id}:`, error);
      throw error;
    }
  },

  /**
   * Remove service from category (admin only)
   * @param {number|string} id - Category item ID
   * @returns {Promise} - Deleted category item
   */
  removeServiceFromCategory: async (id) => {
    try {
      const response = await serviceAPI.removeServiceFromCategory(id);
      return response;
    } catch (error) {
      console.error(`Failed to remove service from category ${id}:`, error);
      throw error;
    }
  },

  // ==================== FORM HANDLING ====================

  /**
   * Validate service form data
   * @param {Object} formData - Service form data
   * @returns {Object} - Validation result
   */
  validateServiceForm: (formData) => {
    const errors = {};
    
    if (!formData.title?.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length < 2) {
      errors.title = 'Title must be at least 2 characters';
    }
    
    if (!formData.image?.trim()) {
      errors.image = 'Image URL is required';
    } else if (!/^https?:\/\/.+/.test(formData.image) && !formData.image.startsWith('/')) {
      errors.image = 'Image must be a valid URL or path';
    }
    
    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }
    
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Get initial service form data
   * @returns {Object} - Initial form data
   */
  getInitialServiceFormData: () => ({
    title: '',
    image: '',
    description: '',
    category: 'Training',
    featured: false
  }),

  /**
   * Map API service to form data
   * @param {Object} service - API service data
   * @returns {Object} - Form data
   */
  mapServiceToForm: (service) => ({
    title: service.title || '',
    image: service.image || '',
    description: service.description || '',
    category: service.category || 'Training',
    featured: service.featured || false
  })
};

// Default export
export default serviceService;
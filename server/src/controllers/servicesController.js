import Service from '../models/Service.js';
import { serviceSchemas } from '../utils/validation.js';

// ==================== SERVICES ====================

// Get all services
export const getAllServices = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      featured,
      search 
    } = req.query;

    const filters = {};
    if (category) filters.category = category;
    if (featured !== undefined) filters.featured = featured === 'true';
    if (search) filters.search = search;

    const result = await Service.findAll(page, limit, filters);
    
    res.json({
      success: true,
      data: {
        services: result.services,
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services'
    });
  }
};

// Get service by ID
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service'
    });
  }
};

// Get featured services
export const getFeaturedServices = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    const services = await Service.getFeatured(limit);
    
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Get featured services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured services'
    });
  }
};

// Get services by category
export const getServicesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const services = await Service.findByCategory(category);
    
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Get services by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services by category'
    });
  }
};

// Get all categories with counts
export const getServiceCategories = async (req, res) => {
  try {
    const categories = await Service.getCategories();
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get service categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service categories'
    });
  }
};

// Create new service (admin only)
export const createService = async (req, res) => {
  try {
    const { error, value } = serviceSchemas.create.validate(req.body, {
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

    const service = await Service.create(value);
    
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update service (admin only)
export const updateService = async (req, res) => {
  try {
    const { error, value } = serviceSchemas.update.validate(req.body, {
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

    const service = await Service.update(req.params.id, value);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service'
    });
  }
};

// Delete service (admin only - soft delete)
export const deleteService = async (req, res) => {
  try {
    const service = await Service.delete(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Service deleted successfully',
      data: {
        id: service.id,
        title: service.title
      }
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service'
    });
  }
};

// ==================== SERVICE CATEGORIES (for the categories section) ====================

// Get all service categories with their services
export const getAllServiceCategories = async (req, res) => {
  try {
    const categories = await Service.getAllServiceCategories();
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get all service categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service categories'
    });
  }
};

// Get service category by ID
export const getServiceCategoryById = async (req, res) => {
  try {
    const category = await Service.getServiceCategoryById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Service category not found'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get service category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service category'
    });
  }
};

// Create service category (admin only)
export const createServiceCategory = async (req, res) => {
  try {
    const { error, value } = serviceSchemas.category.create.validate(req.body, {
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

    const category = await Service.createServiceCategory(value);
    
    res.status(201).json({
      success: true,
      message: 'Service category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Create service category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service category'
    });
  }
};

// Update service category (admin only)
export const updateServiceCategory = async (req, res) => {
  try {
    const { error, value } = serviceSchemas.category.update.validate(req.body, {
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

    const category = await Service.updateServiceCategory(req.params.id, value);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Service category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Service category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Update service category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service category'
    });
  }
};

// Delete service category (admin only - soft delete)
export const deleteServiceCategory = async (req, res) => {
  try {
    const category = await Service.deleteServiceCategory(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Service category not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Service category deleted successfully',
      data: {
        id: category.id,
        name: category.name
      }
    });
  } catch (error) {
    console.error('Delete service category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service category'
    });
  }
};

// ==================== SERVICE CATEGORY ITEMS ====================

// Add service to category (admin only)
export const addServiceToCategory = async (req, res) => {
  try {
    const { error, value } = serviceSchemas.categoryItem.create.validate(req.body, {
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

    const { category_id, service_name, display_order } = value;
    const item = await Service.addServiceToCategory(category_id, service_name, display_order);
    
    res.status(201).json({
      success: true,
      message: 'Service added to category successfully',
      data: item
    });
  } catch (error) {
    console.error('Add service to category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add service to category'
    });
  }
};

// Remove service from category (admin only)
export const removeServiceFromCategory = async (req, res) => {
  try {
    const item = await Service.removeServiceFromCategory(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Service category item not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Service removed from category successfully',
      data: item
    });
  } catch (error) {
    console.error('Remove service from category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove service from category'
    });
  }
};

// Update service category item (admin only)
export const updateServiceCategoryItem = async (req, res) => {
  try {
    const { error, value } = serviceSchemas.categoryItem.update.validate(req.body, {
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

    const item = await Service.updateServiceCategoryItem(req.params.id, value);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Service category item not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Service category item updated successfully',
      data: item
    });
  } catch (error) {
    console.error('Update service category item error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service category item'
    });
  }
};

// ==================== STATISTICS ====================

// Get service statistics
export const getServiceStats = async (req, res) => {
  try {
    const stats = await Service.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get service stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service statistics'
    });
  }
};